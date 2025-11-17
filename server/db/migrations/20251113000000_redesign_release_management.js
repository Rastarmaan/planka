exports.up = async (knex) => {
  // First, drop the old schema if it exists
  const hasReleaseColumn = await knex.schema.hasColumn('card', 'release_id');
  if (hasReleaseColumn) {
    await knex.schema.table('card', (table) => {
      table.dropForeign('release_id');
      table.dropIndex('release_id');
      table.dropColumn('release_id');
    });
  }

  const hasReleaseTable = await knex.schema.hasTable('project_release');
  if (hasReleaseTable) {
    await knex.schema.dropTable('project_release');
  }

  // Also check for board_release in case migration was partially run
  const hasBoardReleaseTable = await knex.schema.hasTable('board_release');
  if (hasBoardReleaseTable) {
    await knex.schema.dropTable('board_release');
  }

  // Create the new comprehensive board_release table (releases are board-specific)
  await knex.schema.createTable('board_release', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    // Required fields
    table.string('version', 50).notNullable();
    table.string('name', 255).notNullable();

    // Target/Goal for the release
    table.text('target');

    // Status
    table.string('status', 20).notNullable().defaultTo('planning');

    // Date range
    table.timestamp('start_date', true);
    table.timestamp('end_date', true);
    table.timestamp('released_at', true);

    /* Foreign Keys */

    table.bigInteger('board_id').notNullable();
    table.foreign('board_id').references('board.id').onDelete('CASCADE');

    /* Indexes */

    table.unique(['board_id', 'version']);
    table.index('board_id');
    table.index('status');
    table.index('start_date');
    table.index('end_date');
  });

  // Create junction table for release-card relationships (many-to-many)
  // This allows cards (including epics and stories) to be in multiple releases if needed
  await knex.schema.createTable('release_card', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Foreign Keys */

    table.bigInteger('release_id').notNullable();
    table.foreign('release_id').references('board_release.id').onDelete('CASCADE');

    table.bigInteger('card_id').notNullable();
    table.foreign('card_id').references('card.id').onDelete('CASCADE');

    /* Indexes */

    table.unique(['release_id', 'card_id']);
    table.index('release_id');
    table.index('card_id');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('release_card');
  await knex.schema.dropTableIfExists('board_release');
};
