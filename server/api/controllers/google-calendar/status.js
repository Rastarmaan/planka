/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const sync = await GoogleCalendarSync.qm.getOneByUserId(currentUser.id);

    if (!sync) {
      return {
        item: {
          isConnected: false,
          isEnabled: false,
        },
      };
    }

    return {
      item: {
        isConnected: true,
        isEnabled: sync.isEnabled,
        calendarId: sync.calendarId,
        lastSyncAt: sync.lastSyncAt,
      },
    };
  },
};
