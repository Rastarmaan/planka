/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Helper to sync custom field values to the linked card
 */

module.exports = {
  inputs: {
    customFieldValue: {
      type: 'ref',
      required: true,
      description: 'The custom field value that was created or updated',
    },
    card: {
      type: 'ref',
      required: true,
      description: 'The card the custom field value belongs to',
    },
  },

  async fn(inputs) {
    const { customFieldValue, card } = inputs;

    if (!card.isSyncEnabled || !card.syncedFromCardId) {
      return;
    }

    const linkedCard = await Card.qm.getOneById(card.syncedFromCardId);
    if (!linkedCard || !linkedCard.isSyncEnabled) {
      return;
    }

    const originalSyncEnabled = linkedCard.isSyncEnabled;
    await Card.update({ id: linkedCard.id }).set({ isSyncEnabled: false });

    try {
      const customField = await CustomField.findOne({ id: customFieldValue.customFieldId });
      if (!customField) {
        return;
      }

      const { board, list, project } = await sails.helpers.cards.getPathToProjectById(
        linkedCard.id,
      );

      if (card.boardId !== linkedCard.boardId) {
        const linkedCustomField = await CustomField.findOne({
          boardId: linkedCard.boardId,
          name: customField.name,
        });

        if (!linkedCustomField) {
          sails.log.warn(
            `[CustomField Sync] No matching custom field found on target board for: ${customField.name}`,
          );
          return;
        }

        const customFieldGroup = await CustomFieldGroup.findOne({
          id: linkedCustomField.customFieldGroupId,
        });

        const existingValue = await CustomFieldValue.findOne({
          cardId: linkedCard.id,
          customFieldId: linkedCustomField.id,
        });

        if (existingValue) {
          sails.log.info(`[CustomField Sync] Value already exists, skipping update`);
        } else {
          await sails.helpers.customFieldValues.createOrUpdateOne.with({
            project,
            board,
            list,
            values: {
              card: linkedCard,
              customField: linkedCustomField,
              customFieldGroup,
              value: customFieldValue.value,
            },
            actorUser: await User.findOne({ id: card.creatorUserId }),
          });

          sails.log.info(
            `[CustomField Sync] Synced custom field value to linked card ${linkedCard.id}`,
          );
        }
      }
    } catch (error) {
      sails.log.error('[CustomField Sync] Error syncing custom field value:', error);
    } finally {
      await Card.update({ id: linkedCard.id }).set({ isSyncEnabled: originalSyncEnabled });
    }
  },
};
