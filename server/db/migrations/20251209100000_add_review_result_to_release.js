exports.up = (knex) => {
  return knex.schema.table('board_release', (table) => {
    table.text('review_result');
  });
};

exports.down = (knex) => {
  return knex.schema.table('board_release', (table) => {
    table.dropColumn('review_result');
  });
};
