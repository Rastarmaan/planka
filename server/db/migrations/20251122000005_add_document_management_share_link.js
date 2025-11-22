exports.up = async (knex) => {
  await knex.schema.createTable('share_link', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('token').notNullable().unique(); // Public URL token
    table.string('resource_type', 20).notNullable(); // 'space', 'folder', 'file'
    table.bigInteger('resource_id').notNullable();

    table.boolean('is_downloadable').notNullable().defaultTo(true);
    table.boolean('is_password_protected').notNullable().defaultTo(false);
    table.text('password_hash'); // Bcrypt hash

    table.timestamp('expires_at', true); // Nullable - no expiration
    table.integer('max_access_count'); // Nullable - unlimited
    table.integer('access_count').notNullable().defaultTo(0);
    table.boolean('is_active').notNullable().defaultTo(true);

    table.timestamp('last_accessed_at', true);
    table.bigInteger('created_by_user_id').notNullable();

    table.timestamp('created_at', true);

    /* Indexes */

    table.index('token');
    table.index(['resource_type', 'resource_id']);
    table.index('created_by_user_id');
    table.index('is_active');

    /* Foreign keys */

    table
      .foreign('created_by_user_id')
      .references('user_account.id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('share_link');
};
