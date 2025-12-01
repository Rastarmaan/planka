exports.up = async (knex) => {
  await knex.schema.createTable('document_file_version', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('file_id').notNullable();
    table.integer('version_number').notNullable();
    table.text('name').notNullable();
    table.bigInteger('size').notNullable();
    table.text('storage_path').notNullable();

    table.bigInteger('uploaded_by_user_id').notNullable();

    table.timestamp('created_at', true);

    /* Indexes */

    table.index('file_id');
    table.unique(['file_id', 'version_number']);

    /* Foreign keys */

    table.foreign('file_id').references('document_file.id').onDelete('CASCADE').onUpdate('CASCADE');

    table
      .foreign('uploaded_by_user_id')
      .references('user_account.id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });

  // Add foreign key from document_file to document_file_version
  await knex.schema.alterTable('document_file', (table) => {
    table
      .foreign('current_version_id')
      .references('document_file_version.id')
      .onDelete('SET NULL')
      .onUpdate('CASCADE');
  });
};

exports.down = async (knex) => {
  // Remove foreign key first
  await knex.schema.alterTable('document_file', (table) => {
    table.dropForeign('current_version_id');
  });

  await knex.schema.dropTable('document_file_version');
};
