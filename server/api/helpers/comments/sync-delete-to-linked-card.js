/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Helper to sync comment deletion to linked cards
 */

module.exports = {
  inputs: {
    comment: {
      type: 'ref',
      required: true,
      description: 'The comment that was deleted',
    },
    card: {
      type: 'ref',
      required: true,
      description: 'The card the comment belonged to',
    },
    actorUser: {
      type: 'ref',
      required: true,
      description: 'The user who deleted the comment',
    },
  },

  async fn(inputs) {
    const { comment, card, actorUser } = inputs;

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

    await Promise.all(
      linkedCards.map(async (linkedCard) => {
        try {
          const matchingComment = await Comment.findOne({
            cardId: linkedCard.id,
            userId: comment.userId,
            text: comment.text,
          });

          if (matchingComment) {
            const { board, list, project } = await sails.helpers.cards.getPathToProjectById(
              linkedCard.id,
            );

            await sails.helpers.comments.deleteOne.with({
              record: matchingComment,
              project,
              board,
              list,
              card: linkedCard,
              actorUser,
              skipSync: true,
            });

            sails.log.info(
              `[Comment Sync] Deleted synced comment ${matchingComment.id} from linked card ${linkedCard.id}`,
            );
          }
        } catch (error) {
          sails.log.error(
            `[Comment Sync] Error deleting synced comment from card ${linkedCard.id}:`,
            error,
          );
        }
      }),
    );
  },
};
