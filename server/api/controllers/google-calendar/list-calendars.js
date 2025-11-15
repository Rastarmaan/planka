/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  async fn() {
    const { currentUser } = this.req;

    if (!currentUser) {
      throw {
        code: 'E_UNAUTHORIZED',
        message: 'User not authenticated',
      };
    }

    const sync = await GoogleCalendarSync.findOne({ userId: currentUser.id });

    if (!sync || !sync.isEnabled) {
      throw {
        code: 'E_NOT_FOUND',
        message: 'Google Calendar is not connected',
      };
    }

    const { calendar } = await sails.helpers.googleCalendar.getClient.with({
      sync,
    });

    try {
      const calendarList = await calendar.calendarList.list();
      const calendars =
        calendarList.data && calendarList.data.items
          ? calendarList.data.items.map((cal) => ({
              id: cal.id,
              summary: cal.summary,
              description: cal.description,
              primary: cal.primary || false,
              accessRole: cal.accessRole,
            }))
          : [];

      return {
        item: calendars,
      };
    } catch (err) {
      sails.log.error('Error fetching calendar list:', err);
      throw {
        code: 'E_SERVER_ERROR',
        message: 'Failed to fetch calendars',
      };
    }
  },
};
