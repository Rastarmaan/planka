/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  // Create card_calendar_event table for mapping cards to calendar events
  const hasCardCalendarEventTable = await knex.schema.hasTable('card_calendar_event');

  if (!hasCardCalendarEventTable) {
    await knex.schema.createTable('card_calendar_event', (table) => {
      /* Columns */

      table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

      table.bigInteger('card_id').notNullable();
      table.bigInteger('user_id').notNullable();
      table.bigInteger('sync_id').notNullable();
      table.text('event_id').notNullable();
      table.text('calendar_id');

      table.timestamp('created_at', true);
      table.timestamp('updated_at', true);

      /* Indexes */

      table.unique(['card_id', 'user_id']); // One event per card per user
      table.index('card_id');
      table.index('user_id');
      table.index('sync_id');
      table.index('event_id');
    });

    // Add foreign key constraints
    await knex.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'card_calendar_event_card_id_fkey'
        ) THEN
          ALTER TABLE card_calendar_event
          ADD CONSTRAINT card_calendar_event_card_id_fkey
          FOREIGN KEY (card_id) REFERENCES card(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await knex.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'card_calendar_event_user_id_fkey'
        ) THEN
          ALTER TABLE card_calendar_event
          ADD CONSTRAINT card_calendar_event_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES "user_account"(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await knex.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'card_calendar_event_sync_id_fkey'
        ) THEN
          ALTER TABLE card_calendar_event
          ADD CONSTRAINT card_calendar_event_sync_id_fkey
          FOREIGN KEY (sync_id) REFERENCES google_calendar_sync(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `);
  }
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('card_calendar_event');
};
