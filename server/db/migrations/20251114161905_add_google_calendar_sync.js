/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  // Create google_calendar_sync table
  const hasGoogleCalendarSyncTable = await knex.schema.hasTable('google_calendar_sync');
  if (!hasGoogleCalendarSyncTable) {
    await knex.schema.createTable('google_calendar_sync', (table) => {
      /* Columns */

      table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

      table.bigInteger('user_id').notNullable();
      table.text('access_token').notNullable();
      table.text('refresh_token');
      table.text('calendar_id');
      table.boolean('is_enabled').notNullable().defaultTo(true);
      table.timestamp('last_sync_at', true);

      table.timestamp('created_at', true);
      table.timestamp('updated_at', true);

      /* Indexes */

      table.unique('user_id');
      table.index('user_id');
    });
  }

  // Add foreign key constraints
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'google_calendar_sync_user_id_fkey'
      ) THEN
        ALTER TABLE google_calendar_sync
        ADD CONSTRAINT google_calendar_sync_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES "user_account"(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `);
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('google_calendar_sync');
};
