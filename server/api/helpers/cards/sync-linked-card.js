/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Helper to sync card properties between two linked cards
 * Syncs all properties EXCEPT list/position changes
 */

module.exports = {
  inputs: {
    sourceCard: {
      type: 'ref',
      required: true,
      description: 'The card that was just updated',
    },
    changedValues: {
      type: 'json',
      required: true,
      description: 'The values that were changed on the source card',
    },
  },

  exits: {
    success: {
      description: 'Sync completed successfully',
    },
  },

  async fn(inputs) {
    const { sourceCard, changedValues } = inputs;

    if (!sourceCard.isSyncEnabled || !sourceCard.syncedFromCardId) {
      return;
    }

    if (changedValues.listId && changedValues.listId !== sourceCard.listId) {
      await Card.qm.updateOne(sourceCard.id, {
        isSyncEnabled: false,
      });

      await Card.qm.updateOne(sourceCard.syncedFromCardId, {
        isSyncEnabled: false,
      });

      sails.sockets.broadcast(`board:${sourceCard.boardId}`, 'cardUpdate', {
        item: {
          id: sourceCard.id,
          isSyncEnabled: false,
        },
      });

      const linkedCard = await Card.qm.getOneById(sourceCard.syncedFromCardId);
      if (linkedCard) {
        sails.sockets.broadcast(`board:${linkedCard.boardId}`, 'cardUpdate', {
          item: {
            id: linkedCard.id,
            isSyncEnabled: false,
          },
        });
      }

      return;
    }

    const linkedCard = await Card.qm.getOneById(sourceCard.syncedFromCardId);
    if (!linkedCard || !linkedCard.isSyncEnabled) {
      return;
    }

    const syncableProperties = [
      'name',
      'description',
      'type',
      'startDate',
      'dueDate',
      'isDueCompleted',
      'stopwatch',
      'isClosed',
      'weight',
      'storyPoints',
      'coverAttachmentId',
    ];

    const syncValues = {};
    syncableProperties.forEach((prop) => {
      if (changedValues[prop] !== undefined) {
        syncValues[prop] = changedValues[prop];
      }
    });

    if (Object.keys(syncValues).length === 0) {
      return;
    }

    const { card: updatedLinkedCard } = await Card.qm.updateOne(linkedCard.id, syncValues);

    sails.sockets.broadcast(`board:${linkedCard.boardId}`, 'cardUpdate', {
      item: updatedLinkedCard,
    });
  },
};
