/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    calendarId: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser) {
      throw {
        code: 'E_UNAUTHORIZED',
        message: 'User not authenticated',
      };
    }

    const sync = await GoogleCalendarSync.findOne({ userId: currentUser.id });

    if (!sync) {
      throw {
        code: 'E_NOT_FOUND',
        message: 'Google Calendar is not connected',
      };
    }

    const { calendar } = await sails.helpers.googleCalendar.getClient.with({
      sync,
    });

    try {
      await calendar.calendars.get({ calendarId: inputs.calendarId });
    } catch (err) {
      sails.log.error('Error verifying calendar access:', err);
      throw {
        code: 'E_BAD_REQUEST',
        message: 'Invalid calendar ID or no access',
      };
    }

    const updatedSync = await GoogleCalendarSync.updateOne(sync.id, {
      calendarId: inputs.calendarId,
    }).fetch();

    return {
      item: {
        calendarId: updatedSync.calendarId,
      },
    };
  },
};
