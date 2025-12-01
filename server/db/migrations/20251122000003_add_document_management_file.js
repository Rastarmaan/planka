exports.up = async (knex) => {
  await knex.schema.createTable('document_file', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('name').notNullable(); // Display name
    table.text('original_name').notNullable(); // Original upload name
    table.bigInteger('space_id').notNullable();
    table.bigInteger('folder_id'); // Nullable for root files

    table.bigInteger('size').notNullable(); // File size in bytes
    table.text('mime_type').notNullable();
    table.text('extension');
    table.text('storage_path').notNullable(); // Path in storage
    table.text('thumbnail_path'); // For image/document previews

    table.bigInteger('current_version_id'); // Points to DocumentFileVersion

    table.boolean('is_deleted').notNullable().defaultTo(false);
    table.timestamp('deleted_at', true);
    table.bigInteger('deleted_by_user_id');

    table.bigInteger('uploaded_by_user_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('space_id');
    table.index('folder_id');
    table.index('is_deleted');
    table.index('uploaded_by_user_id');
    table.index('mime_type');

    /* Foreign keys */

    table.foreign('space_id').references('space.id').onDelete('CASCADE').onUpdate('CASCADE');

    table
      .foreign('folder_id')
      .references('document_folder.id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table
      .foreign('uploaded_by_user_id')
      .references('user_account.id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table
      .foreign('deleted_by_user_id')
      .references('user_account.id')
      .onDelete('SET NULL')
      .onUpdate('CASCADE');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('document_file');
};
