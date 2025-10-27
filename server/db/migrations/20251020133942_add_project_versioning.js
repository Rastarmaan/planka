/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.raw(`
    CREATE SEQUENCE IF NOT EXISTS project_version_id_seq;
  `);

  // Check if table exists before creating it
  const tableExists = await knex.schema.hasTable('project_version');

  if (!tableExists) {
    await knex.schema.createTable('project_version', (table) => {
      table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

      table.bigInteger('project_id').notNullable();
      table.bigInteger('creator_user_id');
      table.string('name').notNullable();
      table.text('description');
      table.json('snapshot_data').notNullable();
      table.json('metadata');
      table.boolean('is_auto_created').defaultTo(false);
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });

      table.index('project_id');
      table.index('creator_user_id');
      table.index('created_at');
      table.index(['project_id', 'created_at']);
    });
  }

  // Add foreign key constraints if they don't exist
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'project_version_project_id_fkey'
      ) THEN
        ALTER TABLE project_version
        ADD CONSTRAINT project_version_project_id_fkey
        FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'project_version_creator_user_id_fkey'
      ) THEN
        ALTER TABLE project_version
        ADD CONSTRAINT project_version_creator_user_id_fkey
        FOREIGN KEY (creator_user_id) REFERENCES "user_account"(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  // Add columns to project table if they don't exist
  const projectHasVersionCount = await knex.schema.hasColumn('project', 'version_count');
  const projectHasLastVersionCreated = await knex.schema.hasColumn(
    'project',
    'last_version_created_at',
  );

  if (!projectHasVersionCount || !projectHasLastVersionCreated) {
    await knex.schema.alterTable('project', (table) => {
      if (!projectHasVersionCount) {
        table.integer('version_count').defaultTo(0);
      }
      if (!projectHasLastVersionCreated) {
        table.timestamp('last_version_created_at', { useTz: true });
      }
    });
  }

  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_project_version_count()
    RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        UPDATE project
        SET version_count = version_count + 1,
            last_version_created_at = NEW.created_at
        WHERE id = NEW.project_id;
        RETURN NEW;
      ELSIF TG_OP = 'DELETE' THEN
        UPDATE project
        SET version_count = GREATEST(version_count - 1, 0)
        WHERE id = OLD.project_id;
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
        SELECT 1 FROM pg_trigger WHERE tgname = 'project_version_count_trigger'
      ) THEN
        CREATE TRIGGER project_version_count_trigger
        AFTER INSERT OR DELETE ON project_version
        FOR EACH ROW EXECUTE FUNCTION update_project_version_count();
      END IF;
    END $$;
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION validate_project_version_limit()
    RETURNS TRIGGER AS $$
    DECLARE
      current_count INTEGER;
      max_versions INTEGER := 30; -- Default limit for projects (smaller than boards)
    BEGIN
      SELECT version_count INTO current_count
      FROM project
      WHERE id = NEW.project_id;

      IF current_count >= max_versions THEN
        RAISE EXCEPTION 'Maximum number of versions (%) reached for project', max_versions;
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
        SELECT 1 FROM pg_trigger WHERE tgname = 'project_version_limit_trigger'
      ) THEN
        CREATE TRIGGER project_version_limit_trigger
        BEFORE INSERT ON project_version
        FOR EACH ROW EXECUTE FUNCTION validate_project_version_limit();
      END IF;
    END $$;
  `);
};

exports.down = async (knex) => {
  await knex.raw('DROP TRIGGER IF EXISTS project_version_limit_trigger ON project_version;');
  await knex.raw('DROP TRIGGER IF EXISTS project_version_count_trigger ON project_version;');

  await knex.raw('DROP FUNCTION IF EXISTS validate_project_version_limit();');
  await knex.raw('DROP FUNCTION IF EXISTS update_project_version_count();');

  await knex.schema.alterTable('project', (table) => {
    table.dropColumn('version_count');
    table.dropColumn('last_version_created_at');
  });

  await knex.schema.dropTableIfExists('project_version');

  await knex.raw('DROP SEQUENCE IF EXISTS project_version_id_seq;');
};
