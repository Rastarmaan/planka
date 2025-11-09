/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.raw(`
    DELETE FROM migration
    WHERE name = '20250121000000_add_board_versioning.js'
  `);
};

exports.down = async () => {};
