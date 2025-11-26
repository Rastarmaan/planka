/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('document_activity', (table) => {
    table.bigInteger('space_id');

    table.index('space_id');
    table.foreign('space_id').references('space.id').onDelete('CASCADE').onUpdate('CASCADE');
  });

  // Populate space_id for existing activities based on resource type
  // For space activities
  await knex.raw(`
    UPDATE document_activity
    SET space_id = resource_id::bigint
    WHERE resource_type = 'space' AND space_id IS NULL
  `);

  // For folder activities
  await knex.raw(`
    UPDATE document_activity da
    SET space_id = df.space
    FROM document_folder df
    WHERE da.resource_type = 'folder'
      AND da.resource_id::bigint = df.id
      AND da.space_id IS NULL
  `);

  // For file activities
  await knex.raw(`
    UPDATE document_activity da
    SET space_id = dfl.space
    FROM document_file dfl
    WHERE da.resource_type = 'file'
      AND da.resource_id::bigint = dfl.id
      AND da.space_id IS NULL
  `);
};

exports.down = async (knex) => {
  await knex.schema.alterTable('document_activity', (table) => {
    table.dropForeign('space_id');
    table.dropIndex('space_id');
    table.dropColumn('space_id');
  });
};
