/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    isEnabled: {
      type: 'boolean',
      required: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const sync = await GoogleCalendarSync.qm.getOneByUserId(currentUser.id);

    if (!sync) {
      throw {
        code: 'E_NOT_FOUND',
        message: 'Google Calendar sync not found',
      };
    }

    const updatedSync = await GoogleCalendarSync.qm.updateOne(sync.id, {
      isEnabled: inputs.isEnabled,
    });

    return {
      item: {
        isConnected: true,
        isEnabled: updatedSync.isEnabled,
        calendarId: updatedSync.calendarId,
        lastSyncAt: updatedSync.lastSyncAt,
      },
    };
  },
};
