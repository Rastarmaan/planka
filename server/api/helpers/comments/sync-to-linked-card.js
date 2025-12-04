/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Helper to sync a comment to the linked card
 */

module.exports = {
  inputs: {
    comment: {
      type: 'ref',
      required: true,
      description: 'The comment that was created',
    },
    card: {
      type: 'ref',
      required: true,
      description: 'The card the comment belongs to',
    },
  },

  async fn(inputs) {
    const { comment, card } = inputs;

    if (!card.isSyncEnabled) {
      return;
    }

    const linkedCardIds = new Set();
    const linkedCards = [];

    if (card.syncedFromCardId) {
      const sourceCard = await Card.qm.getOneById(card.syncedFromCardId);
      if (sourceCard && sourceCard.isSyncEnabled && !linkedCardIds.has(sourceCard.id)) {
        linkedCardIds.add(sourceCard.id);
        linkedCards.push(sourceCard);
      }
    }

    const syncedFromThis = await Card.find({
      syncedFromCardId: card.id,
      isSyncEnabled: true,
    });

    syncedFromThis.forEach((c) => {
      if (!linkedCardIds.has(c.id)) {
        linkedCardIds.add(c.id);
        linkedCards.push(c);
      }
    });

    if (linkedCards.length === 0) {
      return;
    }

    const user = await User.findOne({ id: comment.userId });

    await Promise.all(
      linkedCards.map(async (linkedCard) => {
        try {
          const { board, list, project } = await sails.helpers.cards.getPathToProjectById(
            linkedCard.id,
          );

          await sails.helpers.comments.createOne.with({
            project,
            board,
            list,
            values: {
              card: linkedCard,
              user,
              text: comment.text,
            },
            skipSync: true,
          });

          sails.log.info(
            `[Comment Sync] Synced comment ${comment.id} to linked card ${linkedCard.id}`,
          );
        } catch (error) {
          sails.log.error(`[Comment Sync] Error syncing comment to card ${linkedCard.id}:`, error);
        }
      }),
    );
  },
};
