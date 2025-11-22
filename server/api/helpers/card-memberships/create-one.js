/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
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

  exits: {
    userAlreadyCardMember: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    let cardMembership;
    try {
      cardMembership = await CardMembership.qm.createOne({
        ...values,
        cardId: values.card.id,
        userId: values.user.id,
      });
    } catch (error) {
      if (error.code === 'E_UNIQUE') {
        throw 'userAlreadyCardMember';
      }

      throw error;
    }

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'cardMembershipCreate',
      {
        item: cardMembership,
      },
      inputs.request,
    );

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.CARD_MEMBERSHIP_CREATE,
      buildData: () => ({
        item: cardMembership,
        included: {
          users: [values.user],
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [values.card],
        },
      }),
      user: inputs.actorUser,
    });

    let cardSubscription;
    try {
      cardSubscription = await CardSubscription.qm.createOne({
        cardId: cardMembership.cardId,
        userId: cardMembership.userId,
        isPermanent: false,
      });
    } catch (error) {
      if (error.code !== 'E_UNIQUE') {
        throw error;
      }
    }

    if (cardSubscription) {
      sails.sockets.broadcast(
        `user:${cardMembership.userId}`,
        'cardUpdate',
        {
          item: {
            id: cardMembership.cardId,
            isSubscribed: true,
          },
        },
        inputs.request,
      );

      // TODO: send webhooks
    }

    await sails.helpers.actions.createOne.with({
      webhooks,
      values: {
        type: Action.Types.ADD_MEMBER_TO_CARD,
        data: {
          user: _.pick(values.user, ['id', 'name']),
          card: _.pick(values.card, ['name']),
        },
        user: inputs.actorUser,
        card: values.card,
      },
      project: inputs.project,
      board: inputs.board,
      list: inputs.list,
    });

    if (values.card && (values.card.startDate || values.card.dueDate) && !values.card.isClosed) {
      try {
        const sync = await GoogleCalendarSync.findOne({ userId: cardMembership.userId });
        if (sync && sync.isEnabled) {
          try {
            await sails.helpers.googleCalendar.syncCard.with({
              card: values.card,
              userId: String(cardMembership.userId),
              sync,
            });
          } catch (err) {
            if (err === 'tokenRefreshFailed' || (err && err.code === 'tokenRefreshFailed')) {
              sails.log.warn(
                `[Card Membership Create] Google Calendar token decryption failed for user ${cardMembership.userId}. User needs to reconnect their Google Calendar account.`,
              );
            } else if (err !== 'noDate' && err !== 'cardNotAssigned') {
              sails.log.error(
                `[Card Membership Create] Error syncing card to Google Calendar for user ${cardMembership.userId}:`,
                err,
              );
            }
          }
        }
      } catch (err) {
        sails.log.error('[Card Membership Create] Error checking Google Calendar sync:', err);
      }
    }

    try {
      // eslint-disable-next-line global-require
      const boardSync = require('../../../utils/board-sync');
      await boardSync.syncCardMemberships(values.card.id, inputs.request);
    } catch (syncError) {
      sails.log.error('Error syncing card memberships to linked boards:', syncError);
    }

    return cardMembership;
  },
};
