/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Add card sync fields to support card import and synchronization feature
 * - syncedFromCardId: Reference to the original card that this card was imported from
 * - isSyncEnabled: Boolean flag to control whether sync is active
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    table.bigInteger('synced_from_card_id').nullable();

    table.boolean('is_sync_enabled').defaultTo(false);

    table.foreign('synced_from_card_id').references('id').inTable('card').onDelete('SET NULL');

    table.index('synced_from_card_id');
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    table.dropForeign('synced_from_card_id');
    table.dropColumn('synced_from_card_id');
    table.dropColumn('is_sync_enabled');
  });
};
