/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    project: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    list: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const cardCalendarEvents = await CardCalendarEvent.qm.getByCardId(inputs.record.id);
    if (cardCalendarEvents.length > 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const calendarEvent of cardCalendarEvents) {
        // eslint-disable-next-line no-await-in-loop
        const sync = await GoogleCalendarSync.qm.getOneById(calendarEvent.syncId);
        if (sync && sync.isEnabled) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const { calendar, calendarId } = await sails.helpers.googleCalendar.getClient.with({
              sync,
            });

            // eslint-disable-next-line no-await-in-loop
            await calendar.events.delete({
              calendarId: calendarEvent.calendarId || calendarId,
              eventId: calendarEvent.eventId,
            });
          } catch (err) {
            if (err === 'tokenRefreshFailed' || (err && err.code === 'tokenRefreshFailed')) {
              sails.log.warn(
                `[Card Delete] Google Calendar token decryption failed for sync ${calendarEvent.syncId}. User needs to reconnect their Google Calendar account.`,
              );
            } else {
              sails.log.error('Error deleting calendar event:', err);
            }
          }
        }
        // eslint-disable-next-line no-await-in-loop
        await CardCalendarEvent.qm.deleteOne(calendarEvent.id);
      }
    }

    await sails.helpers.cards.deleteRelated(inputs.record);

    const card = await Card.qm.deleteOne(inputs.record.id);

    if (card) {
      sails.sockets.broadcast(
        `board:${card.boardId}`,
        'cardDelete',
        {
          item: card,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.CARD_DELETE,
        buildData: () => ({
          item: card,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
          },
        }),
        user: inputs.actorUser,
      });

      try {
        // eslint-disable-next-line global-require
        const boardSync = require('../../../utils/board-sync');
        await boardSync.deleteCardFromLinkedBoards(card, inputs.request);
      } catch (syncError) {
        sails.log.error('Error deleting card from linked boards:', syncError);
        // Continue even if sync fails
      }
    }

    return card;
  },
};
