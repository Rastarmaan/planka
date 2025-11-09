exports.up = async (knex) => {
  // Create board_link table for tracking linked/synced boards
  await knex.schema.createTable('board_link', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('source_board_id').notNullable();
    table.bigInteger('linked_board_id').notNullable();

    table.boolean('sync_enabled').notNullable().defaultTo(true);
    table.string('sync_direction', 20).notNullable().defaultTo('bidirectional'); // 'bidirectional', 'one-way', 'none'

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('source_board_id');
    table.index('linked_board_id');
    table.unique(['source_board_id', 'linked_board_id']);

    /* Foreign keys */

    table.foreign('source_board_id').references('board.id').onDelete('CASCADE').onUpdate('CASCADE');
    table.foreign('linked_board_id').references('board.id').onDelete('CASCADE').onUpdate('CASCADE');
  });

  // Create sync_mapping table to track entity mappings between linked boards
  await knex.schema.createTable('sync_mapping', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('board_link_id').notNullable();
    table.string('entity_type', 50).notNullable(); // 'card', 'list', 'label', 'board_membership'
    table.bigInteger('source_entity_id').notNullable();
    table.bigInteger('target_entity_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('board_link_id');
    table.index(['entity_type', 'source_entity_id']);
    table.index(['entity_type', 'target_entity_id']);
    table.unique(['board_link_id', 'entity_type', 'source_entity_id']);

    /* Foreign keys */

    table
      .foreign('board_link_id')
      .references('board_link.id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('sync_mapping');
  await knex.schema.dropTable('board_link');
};
