exports.up = async (knex) => {
  // ایجاد جدول project_release
  await knex.schema.createTable('project_release', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    table.string('version').notNullable();
    table.string('name');
    table.text('description');
    table.string('status').notNullable().defaultTo('unreleased');
    table.timestamp('target_date', true);
    table.timestamp('released_at', true);

    /* Foreign Keys */

    table.bigInteger('project_id').notNullable();
    table.foreign('project_id').references('project.id').onDelete('CASCADE');

    /* Indexes */

    table.unique(['project_id', 'version']);
    table.index('project_id');
    table.index('status');
  });

  // اضافه کردن فیلد release_id به جدول card
  await knex.schema.table('card', (table) => {
    table.bigInteger('release_id');
    table.foreign('release_id').references('project_release.id').onDelete('SET NULL');
    table.index('release_id');
  });
};

exports.down = async (knex) => {
  await knex.schema.table('card', (table) => {
    table.dropForeign('release_id');
    table.dropIndex('release_id');
    table.dropColumn('release_id');
  });

  await knex.schema.dropTable('project_release');
};
