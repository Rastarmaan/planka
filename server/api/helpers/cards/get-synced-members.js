/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Helper to get members from the source card for synced cards
 * Returns members that should be displayed (read-only) on synced cards
 */

module.exports = {
  inputs: {
    card: {
      type: 'ref',
      required: true,
      description: 'The card to get synced members for',
    },
  },

  async fn(inputs) {
    const { card } = inputs;

    if (!card.isSyncEnabled || !card.syncedFromCardId) {
      return [];
    }

    try {
      const sourceCard = await Card.qm.getOneById(card.syncedFromCardId);
      if (!sourceCard) {
        return [];
      }

      const sourceCardMemberships = await CardMembership.find({
        cardId: sourceCard.id,
      }).populate('userId');

      const members = sourceCardMemberships.map((membership) => membership.userId);

      return members;
    } catch (error) {
      sails.log.error('[Card Sync] Error getting synced members:', error);
      return [];
    }
  },
};
