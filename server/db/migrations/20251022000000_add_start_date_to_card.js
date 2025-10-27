/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  // Check if start_date column already exists before adding it
  const hasStartDate = await knex.schema.hasColumn('card', 'start_date');

  if (!hasStartDate) {
    await knex.schema.alterTable('card', (table) => {
      /* Columns */

      table.timestamp('start_date', true);
    });
  }
};

exports.down = (knex) =>
  knex.schema.table('card', (table) => {
    table.dropColumn('start_date');
  });
