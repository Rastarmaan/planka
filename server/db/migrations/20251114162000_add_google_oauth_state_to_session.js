/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  const hasGoogleOauthState = await knex.schema.hasColumn('session', 'google_oauth_state');

  if (!hasGoogleOauthState) {
    await knex.schema.alterTable('session', (table) => {
      table.text('google_oauth_state');
    });
  }
};

exports.down = async (knex) => {
  const hasGoogleOauthState = await knex.schema.hasColumn('session', 'google_oauth_state');

  if (hasGoogleOauthState) {
    await knex.schema.alterTable('session', (table) => {
      table.dropColumn('google_oauth_state');
    });
  }
};
