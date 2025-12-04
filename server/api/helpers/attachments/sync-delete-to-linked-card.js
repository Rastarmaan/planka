/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Helper to sync attachment deletion to linked cards
 */

module.exports = {
  inputs: {
    attachment: {
      type: 'ref',
      required: true,
      description: 'The attachment that was deleted',
    },
    card: {
      type: 'ref',
      required: true,
      description: 'The card the attachment belonged to',
    },
    actorUser: {
      type: 'ref',
      required: true,
      description: 'The user who deleted the attachment',
    },
  },

  async fn(inputs) {
    const { attachment, card, actorUser } = inputs;

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
          const matchingAttachment = await Attachment.findOne({
            cardId: linkedCard.id,
            name: attachment.name,
            type: attachment.type,
          });

          if (matchingAttachment) {
            const { board, list, project } = await sails.helpers.cards.getPathToProjectById(
              linkedCard.id,
            );

            await sails.helpers.attachments.deleteOne.with({
              record: matchingAttachment,
              project,
              board,
              list,
              card: linkedCard,
              actorUser,
              skipSync: true,
            });

            sails.log.info(
              `[Attachment Sync] Deleted synced attachment ${matchingAttachment.id} from linked card ${linkedCard.id}`,
            );
          }
        } catch (error) {
          sails.log.error(
            `[Attachment Sync] Error deleting synced attachment from card ${linkedCard.id}:`,
            error,
          );
        }
      }),
    );
  },
};
