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
    values: {
      type: 'json',
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
    const { values } = inputs;

    const previousText = inputs.record.text;

    const comment = await Comment.qm.updateOne(inputs.record.id, values);

    if (comment) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'commentUpdate',
        {
          item: comment,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.COMMENT_UPDATE,
        buildData: () => ({
          item: comment,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
            cards: [inputs.card],
          },
        }),
        buildPrevData: () => ({
          item: inputs.record,
        }),
        user: inputs.actorUser,
      });

      if (!inputs.skipSync && values.text !== undefined) {
        try {
          await sails.helpers.comments.syncUpdateToLinkedCard.with({
            comment,
            previousText,
            card: inputs.card,
            actorUser: inputs.actorUser,
          });
        } catch (err) {
          sails.log.error('[Comment Sync] Error syncing comment update:', err);
        }
      }
    }

    return comment;
  },
};
