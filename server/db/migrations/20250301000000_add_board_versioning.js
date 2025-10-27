/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.raw(`
    CREATE SEQUENCE IF NOT EXISTS board_version_id_seq;
  `);

  // Check if table exists before creating it
  const tableExists = await knex.schema.hasTable('board_version');

  if (!tableExists) {
    await knex.schema.createTable('board_version', (table) => {
      table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

      table.bigInteger('board_id').notNullable();
      table.bigInteger('creator_user_id');
      table.string('name').notNullable();
      table.text('description');
      table.json('snapshot_data').notNullable();
      table.json('metadata');
      table.boolean('is_auto_created').defaultTo(false);
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });

      table.index('board_id');
      table.index('creator_user_id');
      table.index('created_at');
      table.index(['board_id', 'created_at']);
    });
  }

  // Add foreign key constraints if they don't exist
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'board_version_board_id_fkey'
      ) THEN
        ALTER TABLE board_version
        ADD CONSTRAINT board_version_board_id_fkey
        FOREIGN KEY (board_id) REFERENCES board(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'board_version_creator_user_id_fkey'
      ) THEN
        ALTER TABLE board_version
        ADD CONSTRAINT board_version_creator_user_id_fkey
        FOREIGN KEY (creator_user_id) REFERENCES "user_account"(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  // Add columns to board table if they don't exist
  const boardHasVersionCount = await knex.schema.hasColumn('board', 'version_count');
  const boardHasLastVersionCreated = await knex.schema.hasColumn(
    'board',
    'last_version_created_at',
  );

  if (!boardHasVersionCount || !boardHasLastVersionCreated) {
    await knex.schema.alterTable('board', (table) => {
      if (!boardHasVersionCount) {
        table.integer('version_count').defaultTo(0);
      }
      if (!boardHasLastVersionCreated) {
        table.timestamp('last_version_created_at', { useTz: true });
      }
    });
  }

  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_board_version_count()
    RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        UPDATE board
        SET version_count = version_count + 1,
            last_version_created_at = NEW.created_at
        WHERE id = NEW.board_id;
        RETURN NEW;
      ELSIF TG_OP = 'DELETE' THEN
        UPDATE board
        SET version_count = GREATEST(version_count - 1, 0)
        WHERE id = OLD.board_id;
        RETURN OLD;
      END IF;
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create trigger if it doesn't exist
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'board_version_count_trigger'
      ) THEN
        CREATE TRIGGER board_version_count_trigger
        AFTER INSERT OR DELETE ON board_version
        FOR EACH ROW EXECUTE FUNCTION update_board_version_count();
      END IF;
    END $$;
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION validate_board_version_limit()
    RETURNS TRIGGER AS $$
    DECLARE
      current_count INTEGER;
      max_versions INTEGER := 50; -- Default limit, can be made configurable
    BEGIN
      SELECT version_count INTO current_count
      FROM board
      WHERE id = NEW.board_id;

      IF current_count >= max_versions THEN
        RAISE EXCEPTION 'Maximum number of versions (%) reached for board', max_versions;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create second trigger if it doesn't exist
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'board_version_limit_trigger'
      ) THEN
        CREATE TRIGGER board_version_limit_trigger
        BEFORE INSERT ON board_version
        FOR EACH ROW EXECUTE FUNCTION validate_board_version_limit();
      END IF;
    END $$;
  `);
};

exports.down = async (knex) => {
  await knex.raw('DROP TRIGGER IF EXISTS board_version_limit_trigger ON board_version;');
  await knex.raw('DROP TRIGGER IF EXISTS board_version_count_trigger ON board_version;');

  await knex.raw('DROP FUNCTION IF EXISTS validate_board_version_limit();');
  await knex.raw('DROP FUNCTION IF EXISTS update_board_version_count();');

  await knex.schema.alterTable('board', (table) => {
    table.dropColumn('version_count');
    table.dropColumn('last_version_created_at');
  });

  await knex.schema.dropTableIfExists('board_version');

  await knex.raw('DROP SEQUENCE IF EXISTS board_version_id_seq;');
};
