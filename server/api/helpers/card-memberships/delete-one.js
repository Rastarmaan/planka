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
    user: {
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
    card: {
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
    const cardMembership = await CardMembership.qm.deleteOne(inputs.record.id);

    if (cardMembership) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'cardMembershipDelete',
        {
          item: cardMembership,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.CARD_MEMBERSHIP_DELETE,
        buildData: () => ({
          item: cardMembership,
          included: {
            users: [inputs.user],
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
            cards: [inputs.card],
          },
        }),
        user: inputs.actorUser,
      });

      const cardSubscription = await CardSubscription.qm.deleteOne({
        cardId: cardMembership.cardId,
        userId: cardMembership.userId,
        isPermanent: false,
      });

      if (cardSubscription) {
        sails.sockets.broadcast(`user:${cardMembership.userId}`, 'cardUpdate', {
          item: {
            id: cardMembership.cardId,
            isSubscribed: false,
          },
        });
      }

      try {
        const sync = await GoogleCalendarSync.findOne({ userId: cardMembership.userId });
        if (sync && sync.isEnabled) {
          const calendarEvent = await CardCalendarEvent.qm.getOneByCardIdAndUserId(
            cardMembership.cardId,
            cardMembership.userId,
          );
          if (calendarEvent) {
            try {
              const { calendar, calendarId } = await sails.helpers.googleCalendar.getClient.with({
                sync,
              });

              await calendar.events.delete({
                calendarId: calendarEvent.calendarId || calendarId,
                eventId: calendarEvent.eventId,
              });

              await CardCalendarEvent.qm.deleteOne(calendarEvent.id);
            } catch (err) {
              if (err === 'tokenRefreshFailed' || (err && err.code === 'tokenRefreshFailed')) {
                sails.log.warn(
                  `[Card Membership Delete] Google Calendar token decryption failed for user ${cardMembership.userId}. User needs to reconnect their Google Calendar account.`,
                );
              } else {
                sails.log.error(
                  `[Card Membership Delete] Error deleting calendar event for user ${cardMembership.userId}:`,
                  err,
                );
              }
            }
          }
        }
      } catch (err) {
        sails.log.error('[Card Membership Delete] Error checking Google Calendar sync:', err);
      }

      await sails.helpers.actions.createOne.with({
        webhooks,
        values: {
          type: Action.Types.REMOVE_MEMBER_FROM_CARD,
          data: {
            user: _.pick(inputs.user, ['id', 'name']),
            card: _.pick(inputs.card, ['name']),
          },
          user: inputs.actorUser,
          card: inputs.card,
        },
        project: inputs.project,
        board: inputs.board,
        list: inputs.list,
      });
    }

    return cardMembership;
  },
};
