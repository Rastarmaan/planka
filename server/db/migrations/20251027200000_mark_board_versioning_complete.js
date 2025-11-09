/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  // Check if 20250301000000_add_board_versioning.js is already in the migration table
  const realMigrationExists = await knex('migration')
    .where('name', '20250301000000_add_board_versioning.js')
    .first();

  // If the real migration is not marked as complete, add it to prevent re-execution
  if (!realMigrationExists) {
    await knex('migration').insert({
      name: '20250301000000_add_board_versioning.js',
      batch: 2,
      migration_time: knex.fn.now(),
    });
  }
};

exports.down = async (knex) => {
  // Remove the migration entry if rolling back
  await knex('migration').where('name', '20250301000000_add_board_versioning.js').del();
};
