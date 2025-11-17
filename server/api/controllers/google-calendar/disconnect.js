/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const sync = await GoogleCalendarSync.qm.getOneByUserId(currentUser.id);

    if (sync) {
      await TaskCalendarEvent.qm.deleteMany({
        syncId: sync.id,
      });

      await GoogleCalendarSync.qm.deleteOne(sync.id);
    }

    return {
      item: null,
    };
  },
};
