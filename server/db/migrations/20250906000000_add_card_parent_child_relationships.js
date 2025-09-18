/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    /* Columns */

    table.bigInteger('parent_card_id');

    /* Indexes */

    table.index('parent_card_id');
  });

  await knex.raw(`
    ALTER TABLE card
    ADD CONSTRAINT card_parent_card_id_fkey
    FOREIGN KEY (parent_card_id) REFERENCES card(id) ON DELETE SET NULL;
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION validate_card_parent_child()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Check if parent card exists and is of type 'story'
      IF NEW.parent_card_id IS NOT NULL THEN
        IF NOT EXISTS (
          SELECT 1 FROM card
          WHERE id = NEW.parent_card_id
          AND type = 'story'
        ) THEN
          RAISE EXCEPTION 'Parent card must be of type story';
        END IF;

        -- Check if parent card is in the same board
        IF NOT EXISTS (
          SELECT 1 FROM card
          WHERE id = NEW.parent_card_id
          AND board_id = NEW.board_id
        ) THEN
          RAISE EXCEPTION 'Parent card must be in the same board';
        END IF;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  return knex.raw(`
    CREATE TRIGGER card_parent_child_validation_trigger
    BEFORE INSERT OR UPDATE ON card
    FOR EACH ROW
    EXECUTE FUNCTION validate_card_parent_child();
  `);
};

exports.down = async (knex) => {
  await knex.raw('DROP TRIGGER IF EXISTS card_parent_child_validation_trigger ON card;');
  await knex.raw('DROP FUNCTION IF EXISTS validate_card_parent_child();');

  return knex.schema.table('card', (table) => {
    table.dropColumn('parent_card_id');
  });
};
