/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  // Check if weight column already exists before adding it
  const hasWeight = await knex.schema.hasColumn('card', 'weight');

  if (!hasWeight) {
    await knex.schema.alterTable('card', (table) => {
      /* Columns */

      table.integer('weight').defaultTo(1).notNullable();
    });

    // Add check constraint using raw SQL
    await knex.raw(
      'ALTER TABLE "card" ADD CONSTRAINT "card_weight_check" CHECK (weight >= 1 AND weight <= 10)',
    );
  }
};

exports.down = async (knex) => {
  // Drop constraint first
  await knex.raw('ALTER TABLE "card" DROP CONSTRAINT IF EXISTS "card_weight_check"');

  // Then drop column
  await knex.schema.table('card', (table) => {
    table.dropColumn('weight');
  });
};
