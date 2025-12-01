/**
 * Make card type field nullable to support custom card types from templates
 */

exports.up = async (knex) => {
  // Make the type column nullable
  await knex.schema.alterTable('card', (table) => {
    table.text('type').nullable().alter();
  });
};

exports.down = async (knex) => {
  // Revert to not null (with default value)
  await knex.schema.alterTable('card', (table) => {
    table.text('type').notNullable().alter();
  });
};
