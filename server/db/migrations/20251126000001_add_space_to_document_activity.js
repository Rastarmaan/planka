/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  const hasColumn = await knex.schema.hasColumn('document_activity', 'space_id');

  // Step 1: Add column without foreign key if it doesn't exist
  if (!hasColumn) {
    await knex.schema.alterTable('document_activity', (table) => {
      table.bigInteger('space_id');
    });
  }

  // Step 2: Populate space_id for existing activities based on resource type
  // Only update where the target space exists

  // For space activities - only if space exists
  await knex.raw(`
    UPDATE document_activity da
    SET space_id = da.resource_id::bigint
    FROM space s
    WHERE da.resource_type = 'space'
      AND da.space_id IS NULL
      AND da.resource_id::bigint = s.id
  `);

  // For folder activities
  await knex.raw(`
    UPDATE document_activity da
    SET space_id = df.space_id
    FROM document_folder df
    WHERE da.resource_type = 'folder'
      AND da.resource_id::bigint = df.id
      AND da.space_id IS NULL
  `);

  // For file activities
  await knex.raw(`
    UPDATE document_activity da
    SET space_id = dfl.space_id
    FROM document_file dfl
    WHERE da.resource_type = 'file'
      AND da.resource_id::bigint = dfl.id
      AND da.space_id IS NULL
  `);

  // Step 3: Delete activities that couldn't be associated with a valid space
  await knex.raw(`
    DELETE FROM document_activity
    WHERE space_id IS NULL
  `);

  // Step 4: Now add foreign key constraint
  const hasForeignKey = await knex.schema.raw(`
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'document_activity_space_id_foreign'
    AND table_name = 'document_activity'
  `);

  if (hasForeignKey.rows.length === 0) {
    await knex.schema.alterTable('document_activity', (table) => {
      table.index('space_id');
      table.foreign('space_id').references('space.id').onDelete('CASCADE').onUpdate('CASCADE');
    });
  }
};

exports.down = async (knex) => {
  await knex.schema.alterTable('document_activity', (table) => {
    table.dropForeign('space_id');
    table.dropIndex('space_id');
    table.dropColumn('space_id');
  });
};
