/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { google } = require('googleapis');
const { v4: uuid } = require('uuid');

module.exports = {
  async fn() {
    const { currentUser } = this.req;

    if (!currentUser) {
      throw {
        code: 'E_UNAUTHORIZED',
        message: 'User not authenticated',
      };
    }

    if (!sails.config.custom.googleOAuthClientId || !sails.config.custom.googleOAuthClientSecret) {
      throw {
        code: 'E_SERVER_ERROR',
        message: 'Google OAuth is not configured',
      };
    }

    const oauth2Client = new google.auth.OAuth2(
      sails.config.custom.googleOAuthClientId,
      sails.config.custom.googleOAuthClientSecret,
      sails.config.custom.googleOAuthRedirectUri,
    );

    const state = uuid();

    await sails.sendNativeQuery(
      `UPDATE session SET google_oauth_state = $1 WHERE user_id = $2 AND deleted_at IS NULL`,
      [state, currentUser.id],
    );

    const scopes = ['https://www.googleapis.com/auth/calendar'];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state,
      prompt: 'consent',
    });

    return {
      item: {
        authUrl,
      },
    };
  },
};
