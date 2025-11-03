/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.createTable('card_dependency', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('card_id').notNullable();
    table.bigInteger('depends_on_card_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['card_id', 'depends_on_card_id']);
    table.index('card_id');
    table.index('depends_on_card_id');
  });

  // Add check constraint to prevent self-dependencies
  await knex.raw(`
    ALTER TABLE card_dependency
    ADD CONSTRAINT no_self_dependency CHECK (card_id != depends_on_card_id);
  `);

  // Create validation function to prevent circular dependencies and ensure same board
  await knex.raw(`
    CREATE OR REPLACE FUNCTION validate_card_dependency()
    RETURNS TRIGGER AS $$
    DECLARE
      card_board_id BIGINT;
      depends_on_board_id BIGINT;
    BEGIN
      -- Get board IDs for both cards
      SELECT board_id INTO card_board_id FROM card WHERE id = NEW.card_id;
      SELECT board_id INTO depends_on_board_id FROM card WHERE id = NEW.depends_on_card_id;

      -- Check if both cards exist
      IF card_board_id IS NULL THEN
        RAISE EXCEPTION 'Card with id % does not exist', NEW.card_id;
      END IF;

      IF depends_on_board_id IS NULL THEN
        RAISE EXCEPTION 'Card with id % does not exist', NEW.depends_on_card_id;
      END IF;

      -- Check if cards are in the same board
      IF card_board_id != depends_on_board_id THEN
        RAISE EXCEPTION 'Cards must be in the same board to create dependency';
      END IF;

      -- Check for circular dependencies using recursive CTE
      IF EXISTS (
        WITH RECURSIVE dependency_chain AS (
          -- Start with the new dependency we're trying to create
          SELECT NEW.depends_on_card_id AS card_id, 1 AS depth
          
          UNION ALL
          
          -- Recursively find all cards that the current card depends on
          SELECT cd.depends_on_card_id, dc.depth + 1
          FROM card_dependency cd
          INNER JOIN dependency_chain dc ON cd.card_id = dc.card_id
          WHERE dc.depth < 50  -- Prevent infinite loops
        )
        SELECT 1 FROM dependency_chain WHERE card_id = NEW.card_id
      ) THEN
        RAISE EXCEPTION 'Creating this dependency would create a circular dependency';
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create trigger
  await knex.raw(`
    CREATE TRIGGER card_dependency_validation_trigger
    BEFORE INSERT OR UPDATE ON card_dependency
    FOR EACH ROW
    EXECUTE FUNCTION validate_card_dependency();
  `);
};

exports.down = async (knex) => {
  await knex.raw('DROP TRIGGER IF EXISTS card_dependency_validation_trigger ON card_dependency;');
  await knex.raw('DROP FUNCTION IF EXISTS validate_card_dependency();');

  return knex.schema.dropTable('card_dependency');
};
