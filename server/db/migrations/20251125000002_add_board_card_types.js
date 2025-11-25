exports.up = (knex) =>
  knex.schema.createTable('board_card_type', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('board_id').notNullable();
    table.text('type').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('board_id');
    table.unique(['board_id', 'type']);
  });

exports.down = (knex) => knex.schema.dropTable('board_card_type');
