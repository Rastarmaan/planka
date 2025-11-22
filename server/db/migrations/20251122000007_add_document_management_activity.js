exports.up = async (knex) => {
  await knex.schema.createTable('document_activity', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('user_id'); // Nullable for anonymous access
    table.string('action', 20).notNullable(); // 'create', 'read', 'update', 'delete', 'download', 'share', 'upload', 'move', 'restore'
    table.string('resource_type', 20).notNullable(); // 'space', 'folder', 'file', 'permission', 'shareLink'
    table.bigInteger('resource_id').notNullable();
    table.text('resource_name').notNullable(); // Snapshot of name at action time

    table.jsonb('metadata'); // Additional details (old/new values, etc.)

    table.string('ip_address', 45); // Support IPv6
    table.text('user_agent');

    table.timestamp('created_at', true);

    /* Indexes */

    table.index('user_id');
    table.index(['resource_type', 'resource_id']);
    table.index('action');
    table.index('created_at');

    /* Foreign keys */

    table.foreign('user_id').references('user_account.id').onDelete('SET NULL').onUpdate('CASCADE');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('document_activity');
};
