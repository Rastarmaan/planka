/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  // Check if storyPoints column already exists before adding it
  const hasStoryPoints = await knex.schema.hasColumn('card', 'story_points');

  if (!hasStoryPoints) {
    await knex.schema.alterTable('card', (table) => {
      /* Columns */

      table.integer('story_points').nullable();
    });

    // Add check constraint using raw SQL
    await knex.raw(
      'ALTER TABLE "card" ADD CONSTRAINT "card_story_points_check" CHECK (story_points IS NULL OR (story_points >= 1 AND story_points <= 50))',
    );
  }
};

exports.down = async (knex) => {
  // Drop constraint first
  await knex.raw('ALTER TABLE "card" DROP CONSTRAINT IF EXISTS "card_story_points_check"');

  // Then drop column
  await knex.schema.table('card', (table) => {
    table.dropColumn('story_points');
  });
};
