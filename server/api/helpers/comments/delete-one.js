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
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
    skipSync: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  async fn(inputs) {
    const comment = await Comment.qm.deleteOne(inputs.record.id);

    if (comment) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'commentDelete',
        {
          item: comment,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.COMMENT_DELETE,
        buildData: () => ({
          item: comment,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
            cards: [inputs.card],
          },
        }),
        user: inputs.actorUser,
      });

      if (!inputs.skipSync) {
        try {
          await sails.helpers.comments.syncDeleteToLinkedCard.with({
            comment,
            card: inputs.card,
            actorUser: inputs.actorUser,
          });
        } catch (err) {
          sails.log.error('[Comment Sync] Error syncing comment deletion:', err);
        }
      }
    }

    return comment;
  },
};
