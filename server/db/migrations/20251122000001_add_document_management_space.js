exports.up = async (knex) => {
  await knex.schema.createTable('space', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('name').notNullable();
    table.text('description');
    table.string('color', 7); // Hex color code

    table.boolean('is_deleted').notNullable().defaultTo(false);
    table.timestamp('deleted_at', true);

    table.bigInteger('created_by_user_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('created_by_user_id');
    table.index('is_deleted');

    /* Foreign keys */

    table
      .foreign('created_by_user_id')
      .references('user_account.id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('space');
};
