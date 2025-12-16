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
    import: {
      type: 'json',
    },
    template: {
      type: 'json',
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    requestId: {
      type: 'string',
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const scoper = sails.helpers.projects.makeScoper.with({
      record: values.project,
    });

    const boards = await Board.qm.getByProjectId(values.project.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      values.position,
      boards,
    );

    values.position = position;

    if (repositions.length > 0) {
      await scoper.getUserIdsWithFullProjectVisibility();
      const clonedScoper = scoper.clone();

      // eslint-disable-next-line no-restricted-syntax
      for (const reposition of repositions) {
        // eslint-disable-next-line no-await-in-loop
        await Board.qm.updateOne(
          {
            id: reposition.record.id,
            projectId: reposition.record.projectId,
          },
          {
            position: reposition.position,
          },
        );

        clonedScoper.replaceBoard(reposition.record);
        // eslint-disable-next-line no-await-in-loop
        const boardRelatedUserIds = await clonedScoper.getBoardRelatedUserIds();

        boardRelatedUserIds.forEach((userId) => {
          sails.sockets.broadcast(`user:${userId}`, 'boardUpdate', {
            item: {
              id: reposition.record.id,
              position: reposition.position,
            },
          });
        });

        // TODO: send webhooks
      }
    }

    const boardValues = {
      ...values,
      projectId: values.project.id,
    };

    if (inputs.template) {
      boardValues.templateId = inputs.template.id;
      boardValues.isListsLocked = inputs.template.isListsLocked;
    }

    const { board, boardMembership, lists } = await Board.qm.createOne(boardValues, {
      user: inputs.actorUser,
    });

    if (inputs.template) {
      const templateLists = await BoardTemplateList.find({
        boardTemplateId: inputs.template.id,
      }).sort('position ASC');

      // eslint-disable-next-line no-restricted-syntax
      for (const templateList of templateLists) {
        // eslint-disable-next-line no-await-in-loop
        await List.qm.createOne({
          name: templateList.name,
          position: templateList.position,
          type: List.Types.ACTIVE,
          boardId: board.id,
        });
      }

      const templateCardTypes = await BoardTemplateCardType.find({
        boardTemplateId: inputs.template.id,
      });

      // eslint-disable-next-line no-restricted-syntax
      for (const templateCardType of templateCardTypes) {
        // eslint-disable-next-line no-await-in-loop
        await BoardCardType.create({
          boardId: board.id,
          type: templateCardType.typeName,
        });
      }
    }

    if (inputs.import && inputs.import.type === Board.ImportTypes.TRELLO) {
      const trelloApiKey = process.env.TRELLO_API_KEY || inputs.import.trelloApiKey;
      const trelloApiToken = process.env.TRELLO_API_TOKEN || inputs.import.trelloApiToken;
      await sails.helpers.boards.importFromTrello(
        board,
        lists,
        inputs.import.board,
        trelloApiKey,
        trelloApiToken,
        inputs.actorUser,
      );
    }

    scoper.board = board;
    scoper.boardMemberships = [boardMembership];

    const boardRelatedUserIds = await scoper.getBoardRelatedUserIds();

    boardRelatedUserIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'boardCreate',
        {
          item: board,
          included: {
            boardMemberships: userId === boardMembership.userId ? [boardMembership] : [],
          },
          requestId: inputs.requestId,
        },
        inputs.request,
      );
    });

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.BOARD_CREATE,
      buildData: () => ({
        item: board,
        included: {
          projects: [values.project],
          boardMemberships: [boardMembership],
        },
      }),
      user: inputs.actorUser,
    });

    return {
      board,
      boardMembership,
    };
  },
};
