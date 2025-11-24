exports.up = async (knex) => {
  const hasColumn = await knex.schema.hasColumn('board_release', 'board_version_id');

  if (!hasColumn) {
    await knex.schema.table('board_release', (table) => {
      table.bigInteger('board_version_id');
      table.foreign('board_version_id').references('board_version.id').onDelete('SET NULL');
      table.index('board_version_id');
    });
  }
};

exports.down = async (knex) => {
  const hasColumn = await knex.schema.hasColumn('board_release', 'board_version_id');

  if (hasColumn) {
    await knex.schema.table('board_release', (table) => {
      table.dropForeign('board_version_id');
      table.dropIndex('board_version_id');
      table.dropColumn('board_version_id');
    });
  }
};
