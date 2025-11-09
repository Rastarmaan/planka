/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const boardSync = require('../../../utils/board-sync');

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
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    try {
      await boardSync.deleteLabelFromLinkedBoards(
        inputs.record.id,
        inputs.record.boardId,
        inputs.request,
      );
    } catch (error) {
      sails.log.error('Error syncing label deletion to linked boards:', error);
    }

    await sails.helpers.labels.deleteRelated(inputs.record);

    const label = await Label.qm.deleteOne(inputs.record.id);

    if (label) {
      sails.sockets.broadcast(
        `board:${label.boardId}`,
        'labelDelete',
        {
          item: label,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.LABEL_DELETE,
        buildData: () => ({
          item: label,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
          },
        }),
        user: inputs.actorUser,
      });
    }

    return label;
  },
};
