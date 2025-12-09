exports.up = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    table.text('color');
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    table.dropColumn('color');
  });
};
