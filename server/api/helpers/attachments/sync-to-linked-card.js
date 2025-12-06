/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Helper to sync an attachment to the linked card
 */

module.exports = {
  inputs: {
    attachment: {
      type: 'ref',
      required: true,
      description: 'The attachment that was created',
    },
    card: {
      type: 'ref',
      required: true,
      description: 'The card the attachment belongs to',
    },
    skipSync: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Skip sync to prevent infinite loops',
    },
  },

  async fn(inputs) {
    const { attachment, card, skipSync } = inputs;

    if (skipSync) {
      return;
    }

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

    const creatorUser = await User.findOne({ id: attachment.creatorUserId });

    await Promise.all(
      linkedCards.map(async (linkedCard) => {
        try {
          const { board } = await sails.helpers.cards.getPathToProjectById(linkedCard.id);

          const syncedAttachment = await Attachment.qm.createOne({
            cardId: linkedCard.id,
            creatorUserId: creatorUser.id,
            type: attachment.type,
            name: attachment.name,
            data: attachment.data,
          });

          sails.sockets.broadcast(`board:${board.id}`, 'attachmentCreate', {
            item: sails.helpers.attachments.presentOne(syncedAttachment),
          });

          sails.log.info(
            `[Attachment Sync] Synced attachment ${attachment.id} to linked card ${linkedCard.id}`,
          );
        } catch (error) {
          sails.log.error(
            `[Attachment Sync] Error syncing attachment to card ${linkedCard.id}:`,
            error,
          );
        }
      }),
    );
  },
};
