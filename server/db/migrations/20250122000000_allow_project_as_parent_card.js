/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  // Update the validation function to allow story, epic, and project as parent types
  await knex.raw(`
    CREATE OR REPLACE FUNCTION validate_card_parent_child()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Check if parent card exists and is of type 'story', 'epic', or 'project'
      IF NEW.parent_card_id IS NOT NULL THEN
        IF NOT EXISTS (
          SELECT 1 FROM card
          WHERE id = NEW.parent_card_id
          AND type IN ('story', 'epic', 'project')
        ) THEN
          RAISE EXCEPTION 'Parent card must be of type story, epic, or project';
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
};

exports.down = async (knex) => {
  // Revert back to only allowing story and epic as parent types
  await knex.raw(`
    CREATE OR REPLACE FUNCTION validate_card_parent_child()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Check if parent card exists and is of type 'story' or 'epic'
      IF NEW.parent_card_id IS NOT NULL THEN
        IF NOT EXISTS (
          SELECT 1 FROM card
          WHERE id = NEW.parent_card_id
          AND type IN ('story', 'epic')
        ) THEN
          RAISE EXCEPTION 'Parent card must be of type story or epic';
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
};
