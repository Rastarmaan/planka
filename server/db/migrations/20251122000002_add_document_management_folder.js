exports.up = async (knex) => {
  await knex.schema.createTable('document_folder', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('name').notNullable();
    table.bigInteger('space_id').notNullable();
    table.bigInteger('parent_folder_id'); // Nullable for root folders
    table.text('path').notNullable(); // Full path like /parent/child

    table.boolean('is_deleted').notNullable().defaultTo(false);
    table.timestamp('deleted_at', true);
    table.bigInteger('deleted_by_user_id');

    table.bigInteger('created_by_user_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('space_id');
    table.index('parent_folder_id');
    table.index('is_deleted');
    table.index('created_by_user_id');

    /* Foreign keys */

    table.foreign('space_id').references('space.id').onDelete('CASCADE').onUpdate('CASCADE');

    table
      .foreign('parent_folder_id')
      .references('document_folder.id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table
      .foreign('created_by_user_id')
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
  await knex.schema.dropTable('document_folder');
};
