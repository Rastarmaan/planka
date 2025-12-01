exports.up = async (knex) => {
  await knex.schema.createTable('document_permission', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.string('resource_type', 20).notNullable(); // 'space', 'folder', 'file'
    table.bigInteger('resource_id').notNullable();
    table.bigInteger('user_id').notNullable();

    table.boolean('can_view').notNullable().defaultTo(false);
    table.boolean('can_download').notNullable().defaultTo(false);
    table.boolean('can_edit').notNullable().defaultTo(false);
    table.boolean('can_delete').notNullable().defaultTo(false);
    table.boolean('can_share').notNullable().defaultTo(false);

    table.boolean('inherit_from_parent').notNullable().defaultTo(true);

    table.bigInteger('granted_by_user_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index(['resource_type', 'resource_id']);
    table.index('user_id');
    table.unique(['resource_type', 'resource_id', 'user_id']); // One permission per user per resource

    /* Foreign keys */

    table.foreign('user_id').references('user_account.id').onDelete('CASCADE').onUpdate('CASCADE');

    table
      .foreign('granted_by_user_id')
      .references('user_account.id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('document_permission');
};
