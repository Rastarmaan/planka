/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  // Add team_id column to document_permission table
  await knex.schema.alterTable('document_permission', (table) => {
    // Make user_id nullable since we can have either user_id or team_id
    table.bigint('team_id').nullable();

    // Add foreign key constraint
    table.foreign('team_id').references('id').inTable('team').onDelete('CASCADE');

    // Add index for team_id
    table.index('team_id');
  });

  // Make user_id nullable
  await knex.schema.alterTable('document_permission', (table) => {
    table.bigint('user_id').nullable().alter();
  });

  // Add check constraint to ensure either user_id or team_id is set
  await knex.raw(`
    ALTER TABLE document_permission
    ADD CONSTRAINT document_permission_user_or_team_check
    CHECK (user_id IS NOT NULL OR team_id IS NOT NULL)
  `);
};

exports.down = async (knex) => {
  // Remove check constraint
  await knex.raw(`
    ALTER TABLE document_permission
    DROP CONSTRAINT IF EXISTS document_permission_user_or_team_check
  `);

  // Remove team_id column
  await knex.schema.alterTable('document_permission', (table) => {
    table.dropForeign('team_id');
    table.dropIndex('team_id');
    table.dropColumn('team_id');
  });

  // Make user_id required again
  await knex.schema.alterTable('document_permission', (table) => {
    table.bigint('user_id').notNullable().alter();
  });
};
