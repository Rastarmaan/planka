/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Helper to sync comment updates to linked cards
 */

module.exports = {
  inputs: {
    comment: {
      type: 'ref',
      required: true,
      description: 'The updated comment',
    },
    previousText: {
      type: 'string',
      required: true,
      description: 'The previous text of the comment (before update)',
    },
    card: {
      type: 'ref',
      required: true,
      description: 'The card the comment belongs to',
    },
    actorUser: {
      type: 'ref',
      required: true,
      description: 'The user who updated the comment',
    },
  },

  async fn(inputs) {
    const { comment, previousText, card, actorUser } = inputs;

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
            text: previousText,
          });

          if (matchingComment) {
            const { board, list, project } = await sails.helpers.cards.getPathToProjectById(
              linkedCard.id,
            );

            await sails.helpers.comments.updateOne.with({
              record: matchingComment,
              values: {
                text: comment.text,
              },
              project,
              board,
              list,
              card: linkedCard,
              actorUser,
              skipSync: true,
            });

            sails.log.info(
              `[Comment Sync] Updated synced comment ${matchingComment.id} on linked card ${linkedCard.id}`,
            );
          }
        } catch (error) {
          sails.log.error(
            `[Comment Sync] Error updating synced comment on card ${linkedCard.id}:`,
            error,
          );
        }
      }),
    );
  },
};
