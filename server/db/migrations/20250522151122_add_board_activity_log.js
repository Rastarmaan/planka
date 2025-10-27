/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  // Check if board_id column already exists before adding it
  const hasBoardId = await knex.schema.hasColumn('action', 'board_id');

  if (!hasBoardId) {
    await knex.schema.alterTable('action', (table) => {
      /* Columns */

      table.bigInteger('board_id');

      /* Indexes */

      table.index('board_id');
    });
  }

  return knex.raw(`
    UPDATE action
    SET
      board_id = card.board_id,
      data = data || jsonb_build_object('card', jsonb_build_object('name', card.name))
    FROM card
    WHERE action.card_id = card.id;
  `);
};

exports.down = (knex) =>
  knex.schema.table('action', (table) => {
    table.dropColumn('board_id');
  });
