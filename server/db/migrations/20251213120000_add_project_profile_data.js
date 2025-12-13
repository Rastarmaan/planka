module.exports.up = (knex) =>
  knex.schema.createTable('project_profile_data', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('project_id').notNullable();
    table.bigInteger('profile_id').notNullable();
    table.bigInteger('field_id').notNullable();
    table.text('value').defaultTo('');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('project_id');
    table.index('profile_id');
    table.index('field_id');

    /* Foreign keys */

    table.foreign('project_id').references('project.id').onDelete('CASCADE');
    table.foreign('profile_id').references('project_profile.id').onDelete('CASCADE');
    table.foreign('field_id').references('project_profile_field.id').onDelete('CASCADE');

    table.unique(['project_id', 'field_id']);
  });

module.exports.down = (knex) => knex.schema.dropTable('project_profile_data');

module.exports.config = { transaction: false };
