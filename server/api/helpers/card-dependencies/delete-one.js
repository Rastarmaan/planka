/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    record: {
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
    card: {
      type: 'ref',
      required: true,
    },
    dependsOnCard: {
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

  async fn(inputs) {
    const cardDependency = await CardDependency.qm.destroyOne(inputs.record.id);

    if (!cardDependency) {
      return cardDependency;
    }

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'cardDependencyDelete',
      {
        item: cardDependency,
      },
      inputs.request,
    );

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.CARD_DEPENDENCY_DELETE,
      buildData: () => ({
        item: cardDependency,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [inputs.card, inputs.dependsOnCard],
        },
      }),
      user: inputs.actorUser,
    });

    await sails.helpers.actions.createOne.with({
      webhooks,
      values: {
        type: Action.Types.REMOVE_DEPENDENCY_FROM_CARD,
        data: {
          card: _.pick(inputs.card, ['id', 'name']),
          dependsOnCard: _.pick(inputs.dependsOnCard, ['id', 'name']),
        },
        user: inputs.actorUser,
        card: inputs.card,
      },
      project: inputs.project,
      board: inputs.board,
      list: inputs.list,
    });

    return cardDependency;
  },
};
