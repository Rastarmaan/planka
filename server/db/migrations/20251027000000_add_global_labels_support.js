/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  // Check if is_global column already exists before adding it
  const hasIsGlobal = await knex.schema.hasColumn('label', 'is_global');

  if (!hasIsGlobal) {
    await knex.schema.alterTable('label', (table) => {
      table.boolean('is_global').defaultTo(false);
    });
  }

  // Make board_id nullable to support global labels
  await knex.raw(`
    ALTER TABLE label ALTER COLUMN board_id DROP NOT NULL;
  `);

  // Add index for global labels
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS label_is_global_idx ON label (is_global) WHERE is_global = true;
  `);

  // Add constraint to ensure global labels don't have board_id
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'label_global_check'
      ) THEN
        ALTER TABLE label
        ADD CONSTRAINT label_global_check
        CHECK (
          (is_global = true AND board_id IS NULL) OR
          (is_global = false AND board_id IS NOT NULL)
        );
      END IF;
    END $$;
  `);
};

exports.down = async (knex) => {
  // Remove constraint
  await knex.raw('ALTER TABLE label DROP CONSTRAINT IF EXISTS label_global_check;');

  // Remove index
  await knex.raw('DROP INDEX IF EXISTS label_is_global_idx;');

  // Make board_id NOT NULL again (will fail if global labels exist)
  await knex.raw(`
    ALTER TABLE label ALTER COLUMN board_id SET NOT NULL;
  `);

  // Drop is_global column
  await knex.schema.alterTable('label', (table) => {
    table.dropColumn('is_global');
  });
};
