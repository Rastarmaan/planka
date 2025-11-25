module.exports.up = async (knex) => {
  // Create board_template table
  const hasBoardTemplateTable = await knex.schema.hasTable('board_template');
  if (!hasBoardTemplateTable) {
    await knex.schema.createTable('board_template', (table) => {
      /* Columns */

      table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

      table.text('name').notNullable();
      table.text('description');
      table.boolean('is_lists_locked').notNullable().defaultTo(false);
      table.bigInteger('created_by_user_id');

      table.timestamp('created_at', true);
      table.timestamp('updated_at', true);

      /* Indexes */

      table.index('created_by_user_id');
    });
  }

  // Create board_template_list table
  const hasBoardTemplateListTable = await knex.schema.hasTable('board_template_list');
  if (!hasBoardTemplateListTable) {
    await knex.schema.createTable('board_template_list', (table) => {
      /* Columns */

      table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

      table.bigInteger('board_template_id').notNullable();
      table.text('name').notNullable();
      table.float('position').notNullable();

      table.timestamp('created_at', true);
      table.timestamp('updated_at', true);

      /* Indexes */

      table.index('board_template_id');
    });
  }

  // Create board_template_card_type table
  const hasBoardTemplateCardTypeTable = await knex.schema.hasTable('board_template_card_type');
  if (!hasBoardTemplateCardTypeTable) {
    await knex.schema.createTable('board_template_card_type', (table) => {
      /* Columns */

      table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

      table.bigInteger('board_template_id').notNullable();
      table.text('type_name').notNullable();
      table.text('color');
      table.boolean('is_default').notNullable().defaultTo(false);

      table.timestamp('created_at', true);
      table.timestamp('updated_at', true);

      /* Indexes */

      table.index('board_template_id');
      table.unique(['board_template_id', 'type_name']);
    });
  }

  // Add template_id and is_lists_locked to board table
  const hasBoardTemplateIdColumn = await knex.schema.hasColumn('board', 'template_id');
  const hasBoardIsListsLockedColumn = await knex.schema.hasColumn('board', 'is_lists_locked');

  if (!hasBoardTemplateIdColumn || !hasBoardIsListsLockedColumn) {
    await knex.schema.table('board', (table) => {
      if (!hasBoardTemplateIdColumn) {
        table.bigInteger('template_id');
        table.index('template_id');
      }
      if (!hasBoardIsListsLockedColumn) {
        table.boolean('is_lists_locked').notNullable().defaultTo(false);
      }
    });
  }
};

module.exports.down = async (knex) => {
  // Remove columns from board table
  const hasBoardTemplateIdColumn = await knex.schema.hasColumn('board', 'template_id');
  const hasBoardIsListsLockedColumn = await knex.schema.hasColumn('board', 'is_lists_locked');

  if (hasBoardTemplateIdColumn || hasBoardIsListsLockedColumn) {
    await knex.schema.table('board', (table) => {
      if (hasBoardTemplateIdColumn) {
        table.dropIndex('template_id');
        table.dropColumn('template_id');
      }
      if (hasBoardIsListsLockedColumn) {
        table.dropColumn('is_lists_locked');
      }
    });
  }

  // Drop board_template_card_type table
  const hasBoardTemplateCardTypeTable = await knex.schema.hasTable('board_template_card_type');
  if (hasBoardTemplateCardTypeTable) {
    await knex.schema.dropTable('board_template_card_type');
  }

  // Drop board_template_list table
  const hasBoardTemplateListTable = await knex.schema.hasTable('board_template_list');
  if (hasBoardTemplateListTable) {
    await knex.schema.dropTable('board_template_list');
  }

  // Drop board_template table
  const hasBoardTemplateTable = await knex.schema.hasTable('board_template');
  if (hasBoardTemplateTable) {
    await knex.schema.dropTable('board_template');
  }
};
