module.exports.up = (knex) =>
  knex.schema.createTable('project_history', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));
    table.bigInteger('project_id').notNullable();
    table.bigInteger('created_by_user_id');
    table.text('text').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    table.index('project_id');
    table.index(['project_id', 'created_at']);

    table.foreign('project_id').references('project.id').onDelete('CASCADE');
    table.foreign('created_by_user_id').references('user_account.id').onDelete('SET NULL');
  });

module.exports.down = (knex) => knex.schema.dropTable('project_history');

module.exports.config = { transaction: false };
