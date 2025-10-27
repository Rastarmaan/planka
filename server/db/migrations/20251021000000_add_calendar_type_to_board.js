/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  // Check if calendar_type column already exists before adding it
  const hasCalendarType = await knex.schema.hasColumn('board', 'calendar_type');

  if (!hasCalendarType) {
    await knex.schema.alterTable('board', (table) => {
      /* Columns */

      table.string('calendar_type', 10).notNullable().defaultTo('gregorian');
    });

    await knex.schema.alterTable('board', (table) => {
      table.string('calendar_type', 10).notNullable().alter();
    });
  }
};

exports.down = (knex) =>
  knex.schema.table('board', (table) => {
    table.dropColumn('calendar_type');
  });
