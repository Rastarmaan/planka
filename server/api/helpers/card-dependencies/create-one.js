/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      required: true,
    },
    project: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    list: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    dependencyAlreadyExists: {},
    circularDependency: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    let cardDependency;
    try {
      cardDependency = await CardDependency.qm.createOne({
        ...values,
        cardId: values.card.id,
        dependsOnCardId: values.dependsOnCard.id,
      });
    } catch (error) {
      if (error.code === 'E_UNIQUE') {
        throw 'dependencyAlreadyExists';
      }

      if (error.message && error.message.includes('circular dependency')) {
        throw 'circularDependency';
      }

      throw error;
    }

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'cardDependencyCreate',
      {
        item: cardDependency,
      },
      inputs.request,
    );

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.CARD_DEPENDENCY_CREATE,
      buildData: () => ({
        item: cardDependency,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [values.card, values.dependsOnCard],
        },
      }),
      user: inputs.actorUser,
    });

    await sails.helpers.actions.createOne.with({
      webhooks,
      values: {
        type: Action.Types.ADD_DEPENDENCY_TO_CARD,
        data: {
          card: _.pick(values.card, ['id', 'name']),
          dependsOnCard: _.pick(values.dependsOnCard, ['id', 'name']),
        },
        user: inputs.actorUser,
        card: values.card,
      },
      project: inputs.project,
      board: inputs.board,
      list: inputs.list,
    });

    return cardDependency;
  },
};
