/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { google } = require('googleapis');

const Errors = {
  INVALID_STATE: {
    code: 'E_BAD_REQUEST',
    message: 'Invalid state parameter',
  },
  INVALID_CODE: {
    code: 'E_BAD_REQUEST',
    message: 'Invalid authorization code',
  },
  OAUTH_ERROR: {
    code: 'E_SERVER_ERROR',
    message: 'OAuth authentication failed',
  },
};

module.exports = {
  async fn() {
    const { code, state, error } = this.req.query;

    const frontendBaseUrl =
      sails.config.environment === 'production'
        ? sails.config.custom.baseUrl
        : 'http://localhost:3000';

    if (error) {
      sails.log.warn(`Google OAuth error: ${error}`);
      return this.res.redirect(
        `${frontendBaseUrl}?googleCalendarError=${encodeURIComponent(error)}`,
      );
    }

    if (!code || !state) {
      return this.res.redirect(`${frontendBaseUrl}?googleCalendarError=missing_parameters`);
    }

    const sessionResult = await sails.sendNativeQuery(
      `SELECT user_id, google_oauth_state FROM session WHERE google_oauth_state = $1 AND deleted_at IS NULL LIMIT 1`,
      [state],
    );

    const session = sessionResult.rows[0];

    if (!session) {
      return this.res.redirect(`${frontendBaseUrl}?googleCalendarError=session_not_found`);
    }

    if (session.google_oauth_state !== state) {
      return this.res.redirect(`${frontendBaseUrl}?googleCalendarError=state_mismatch`);
    }

    const userId = session.user_id;

    await sails.sendNativeQuery(
      `UPDATE session SET google_oauth_state = NULL WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId],
    );

    if (!sails.config.custom.googleOAuthClientId || !sails.config.custom.googleOAuthClientSecret) {
      return this.res.redirect(`${frontendBaseUrl}?googleCalendarError=not_configured`);
    }

    const oauth2Client = new google.auth.OAuth2(
      sails.config.custom.googleOAuthClientId,
      sails.config.custom.googleOAuthClientSecret,
      sails.config.custom.googleOAuthRedirectUri,
    );

    let tokens;
    try {
      const { tokens: receivedTokens } = await oauth2Client.getToken(code);
      tokens = receivedTokens;
    } catch (err) {
      sails.log.error('Error exchanging code for tokens:', {
        message: err.message,
        code: err.code,
        response: err.response && err.response.data ? err.response.data : null,
      });
      const errorMessage =
        err.message && err.message.includes('invalid_client')
          ? 'invalid_client'
          : 'token_exchange_failed';
      return this.res.redirect(`${frontendBaseUrl}?googleCalendarError=${errorMessage}`);
    }

    if (!tokens.access_token) {
      throw Errors.OAUTH_ERROR;
    }

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    let calendarId = 'primary';
    try {
      const calendarList = await calendar.calendarList.list();

      let plankaCalendar = null;
      if (calendarList.data.items && calendarList.data.items.length > 0) {
        plankaCalendar = calendarList.data.items.find(
          (cal) => cal.summary && cal.summary.toLowerCase() === 'planka',
        );
      }

      if (plankaCalendar) {
        calendarId = plankaCalendar.id;
      } else {
        try {
          const createdCalendar = await calendar.calendars.insert({
            requestBody: {
              summary: 'Planka',
              description: 'Calendar for Planka task management synchronization',
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            },
          });

          calendarId = createdCalendar.data.id;
        } catch (createErr) {
          if (calendarList.data.items && calendarList.data.items.length > 0) {
            const primaryCalendar = calendarList.data.items.find((cal) => cal.primary);
            calendarId = primaryCalendar ? primaryCalendar.id : calendarList.data.items[0].id;
          }
        }
      }
    } catch (err) {
      sails.log.warn('Error fetching calendar list, using primary:', err);
    }

    let sync = await GoogleCalendarSync.findOne({ userId });

    if (sync) {
      const updatedSync = await GoogleCalendarSync.updateOne(sync.id, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || sync.refreshToken,
        calendarId,
        isEnabled: true,
        lastSyncAt: new Date(),
      }).fetch();
      sync = updatedSync || sync;
      sync.accessToken = tokens.access_token;
      sync.refreshToken = tokens.refresh_token || sync.refreshToken;
    } else {
      const createdSync = await GoogleCalendarSync.create({
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        calendarId,
        isEnabled: true,
        lastSyncAt: new Date(),
      }).fetch();
      sync = createdSync;
      sync.accessToken = tokens.access_token;
      sync.refreshToken = tokens.refresh_token;
    }

    if (sync && sync.isEnabled) {
      try {
        const cardMemberships = await CardMembership.find({ userId }).limit(1000);
        const cardIds = cardMemberships.map((m) => m.cardId);

        if (cardIds.length > 0) {
          const allCards = await Card.find({
            id: cardIds,
            isClosed: false,
          });
          const cards = allCards.filter((card) => card.startDate || card.dueDate);

          // eslint-disable-next-line no-restricted-syntax
          for (const card of cards) {
            if (card.startDate || card.dueDate) {
              try {
                let syncToUse = sync;
                if (!syncToUse || !syncToUse.id) {
                  // eslint-disable-next-line no-await-in-loop
                  const refetchedSync = await GoogleCalendarSync.qm.getOneByUserId(userId);
                  if (!refetchedSync) {
                    // eslint-disable-next-line no-continue
                    continue;
                  }
                  syncToUse = refetchedSync;
                }

                // eslint-disable-next-line no-await-in-loop
                await sails.helpers.googleCalendar.syncCard.with({
                  card,
                  userId: String(userId),
                  sync: syncToUse,
                });
              } catch (err) {
                if (err !== 'noDate' && err !== 'cardNotAssigned') {
                  // Silently skip errors during initial sync
                }
              }
            }
          }
        }
      } catch (syncError) {
        // Don't fail the whole callback if sync fails
      }
    }

    return this.res.redirect(`${frontendBaseUrl}?googleCalendarConnected=true`);
  },
};
