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
    values: {
      type: 'json',
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
    webhooks: {
      type: 'ref',
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    positionMustBeInValues: {},
    boardInValuesMustBelongToProject: {},
    listMustBeInValues: {},
    listInValuesMustBelongToBoard: {},
    coverAttachmentInValuesMustContainImage: {},
  },

  // TODO: use normalizeValues and refactor
  async fn(inputs) {
    const { isSubscribed, ...values } = inputs.values;

    if (values.project && values.project.id === inputs.project.id) {
      delete values.project;
    }

    const project = values.project || inputs.project;

    if (values.board) {
      if (values.board.projectId !== project.id) {
        throw 'boardInValuesMustBelongToProject';
      }

      if (values.board.id === inputs.board.id) {
        delete values.board;
      } else {
        values.boardId = values.board.id;
      }
    }

    const board = values.board || inputs.board;

    if (values.list) {
      if (values.list.boardId !== board.id) {
        throw 'listInValuesMustBelongToBoard';
      }

      if (values.list.id === inputs.list.id) {
        delete values.list;
      } else {
        values.listId = values.list.id;
      }
    } else if (values.board) {
      throw 'listMustBeInValues';
    }

    const list = values.list || inputs.list;

    if (sails.helpers.lists.isFinite(list)) {
      if (values.list && _.isUndefined(values.position)) {
        throw 'positionMustBeInValues';
      }
    } else {
      values.position = null;
    }

    if (values.coverAttachment) {
      if (!values.coverAttachment.data.image) {
        throw 'coverAttachmentInValuesMustContainImage';
      }

      values.coverAttachmentId = values.coverAttachment.id;
    }

    const dueDate = _.isUndefined(values.dueDate) ? inputs.record.dueDate : values.dueDate;

    if (dueDate) {
      const isDueCompleted = _.isUndefined(values.isDueCompleted)
        ? inputs.record.isDueCompleted
        : values.isDueCompleted;

      if (_.isNull(isDueCompleted)) {
        values.isDueCompleted = false;
      }
    } else {
      values.isDueCompleted = null;
    }

    let card;
    if (_.isEmpty(values)) {
      card = inputs.record;
    } else {
      const { webhooks = await Webhook.qm.getAll() } = inputs;

      if (!_.isNil(values.position)) {
        const cards = await Card.qm.getByListId(list.id, {
          exceptIdOrIds: inputs.record.id,
        });

        const { position, repositions } = sails.helpers.utils.insertToPositionables(
          values.position,
          cards,
        );

        values.position = position;

        if (repositions.length > 0) {
          // eslint-disable-next-line no-restricted-syntax
          for (const reposition of repositions) {
            // eslint-disable-next-line no-await-in-loop
            await Card.qm.updateOne(
              {
                id: reposition.record.id,
                listId: reposition.record.listId,
              },
              {
                position: reposition.position,
              },
            );

            sails.sockets.broadcast(`board:${board.id}`, 'cardUpdate', {
              item: {
                id: reposition.record.id,
                position: reposition.position,
              },
            });

            // TODO: send webhooks
          }
        }
      }

      let prevLabels;
      if (values.board) {
        prevLabels = await sails.helpers.cards.getLabels(inputs.record.id);

        const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(values.board.id);

        await CardSubscription.qm.delete({
          cardId: inputs.record.id,
          userId: {
            '!=': boardMemberUserIds,
          },
        });

        await CardMembership.qm.delete({
          cardId: inputs.record.id,
          userId: {
            '!=': boardMemberUserIds,
          },
        });

        await CardLabel.qm.delete({
          cardId: inputs.record.id,
        });

        const taskLists = await TaskList.qm.getByCardId(inputs.record.id);
        const taskListIds = sails.helpers.utils.mapRecords(taskLists);

        await Task.qm.update(
          {
            taskListId: taskListIds,
            assigneeUserId: {
              '!=': boardMemberUserIds,
            },
          },
          {
            assigneeUserId: null,
          },
        );

        await sails.helpers.cards.detachCustomFields(
          inputs.record.id,
          inputs.board.id,
          !!values.project,
        );
      }

      if (values.list) {
        if (values.board || inputs.list.type === List.Types.TRASH) {
          values.prevListId = null;
        } else if (sails.helpers.lists.isArchiveOrTrash(values.list)) {
          values.prevListId = inputs.list.id;
        } else if (inputs.list.type === List.Types.ARCHIVE) {
          values.prevListId = null;
        }

        const typeState = List.TYPE_STATE_BY_TYPE[values.list.type];

        if (inputs.record.isClosed) {
          if (typeState === List.TypeStates.OPENED) {
            values.isClosed = false;
          }
        } else if (typeState === List.TypeStates.CLOSED) {
          values.isClosed = true;
        }

        values.listChangedAt = new Date().toISOString();
      }

      const updateResult = await Card.qm.updateOne(inputs.record.id, values);

      ({ card } = updateResult);
      const { tasks } = updateResult;

      if (!card) {
        return card;
      }

      if (values.board) {
        const labels = await Label.qm.getByBoardId(card.boardId);
        const labelByName = _.keyBy(labels, 'name');

        const labelIds = await Promise.all(
          prevLabels.map(async (label) => {
            if (labelByName[label.name]) {
              return labelByName[label.name].id;
            }

            const { id } = await sails.helpers.labels.createOne.with({
              project,
              webhooks,
              values: {
                ..._.omit(label, ['id', 'boardId', 'createdAt', 'updatedAt']),
                board,
              },
              actorUser: inputs.actorUser,
            });

            return id;
          }),
        );

        await Promise.all(
          labelIds.map((labelId) => {
            try {
              return CardLabel.qm.createOne({
                labelId,
                cardId: card.id,
              });
            } catch (error) {
              if (error.code !== 'E_UNIQUE') {
                throw error;
              }
            }

            return Promise.resolve();
          }),
        );

        sails.sockets.broadcast(
          `board:${inputs.board.id}`,
          'cardUpdate',
          {
            item: {
              id: card.id,
              boardId: null,
            },
          },
          inputs.request,
        );

        sails.sockets.broadcast(`board:${card.boardId}`, 'cardUpdate', {
          item: card,
        });

        // TODO: add transfer action
      } else {
        sails.sockets.broadcast(
          `board:${card.boardId}`,
          'cardUpdate',
          {
            item: card,
          },
          inputs.request,
        );

        if (values.list) {
          await sails.helpers.actions.createOne.with({
            webhooks,
            values: {
              card,
              type: Action.Types.MOVE_CARD,
              data: {
                card: _.pick(card, ['name']),
                fromList: _.pick(inputs.list, ['id', 'type', 'name']),
                toList: _.pick(values.list, ['id', 'type', 'name']),
              },
              user: inputs.actorUser,
            },
            project: inputs.project,
            board: inputs.board,
            list: values.list,
          });
        }
      }

      if (tasks) {
        const taskListIds = sails.helpers.utils.mapRecords(tasks, 'taskListId', true);
        const taskLists = await TaskList.qm.getByIds(taskListIds);
        const taskListById = _.keyBy(taskLists, 'id');

        const cardIds = sails.helpers.utils.mapRecords(taskLists, 'cardId', true);
        const cards = await Card.qm.getByIds(cardIds);
        const cardById = _.keyBy(cards, 'id');

        const boardIdByTaskId = tasks.reduce(
          (result, task) => ({
            ...result,
            [task.id]: cardById[taskListById[task.taskListId].cardId].boardId,
          }),
          {},
        );

        tasks.forEach((task) => {
          sails.sockets.broadcast(`board:${boardIdByTaskId[task.id]}`, 'taskUpdate', {
            item: task,
          });
        });

        // TODO: send webhooks
      }

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.CARD_UPDATE,
        buildData: () => ({
          item: card,
          included: {
            projects: [project],
            boards: [board],
            lists: [list],
          },
        }),
        buildPrevData: () => ({
          item: inputs.record,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
          },
        }),
        user: inputs.actorUser,
      });
    }

    if (!_.isUndefined(isSubscribed)) {
      const wasSubscribed = await sails.helpers.users.isCardSubscriber(
        inputs.actorUser.id,
        card.id,
      );

      if (isSubscribed !== wasSubscribed) {
        if (isSubscribed) {
          try {
            await CardSubscription.qm.createOne({
              cardId: card.id,
              userId: inputs.actorUser.id,
            });
          } catch (error) {
            if (error.code !== 'E_UNIQUE') {
              throw error;
            }
          }
        } else {
          await CardSubscription.qm.deleteOne({
            cardId: card.id,
            userId: inputs.actorUser.id,
          });
        }

        sails.sockets.broadcast(
          `user:${inputs.actorUser.id}`,
          'cardUpdate',
          {
            item: {
              isSubscribed,
              id: card.id,
            },
          },
          inputs.request,
        );

        // TODO: send webhooks
      }
    }

    try {
      // eslint-disable-next-line global-require
      const boardSync = require('../../../utils/board-sync');
      await boardSync.syncCard(card, inputs.request);
    } catch (syncError) {
      sails.log.error('Error syncing card:', syncError);
      // Continue even if sync fails
    }

    const hadDatesBefore = !!(inputs.record.startDate || inputs.record.dueDate);
    const hasDatesAfter = !!(card.startDate || card.dueDate);
    const datesAdded = !hadDatesBefore && hasDatesAfter;
    const datesChanged =
      (values.startDate !== undefined && values.startDate !== inputs.record.startDate) ||
      (values.dueDate !== undefined && values.dueDate !== inputs.record.dueDate);
    const datesRemoved =
      (values.startDate === null && inputs.record.startDate) ||
      (values.dueDate === null && inputs.record.dueDate);

    if (datesAdded || datesChanged || datesRemoved || values.isClosed !== undefined) {
      const cardMemberships = await CardMembership.qm.getByCardId(card.id);
      const assignedUserIds = cardMemberships.map((m) => String(m.userId));

      const allCalendarEvents = await CardCalendarEvent.find({ cardId: card.id });

      // eslint-disable-next-line no-restricted-syntax
      for (const calendarEvent of allCalendarEvents) {
        const eventUserId = String(calendarEvent.userId);
        if (!assignedUserIds.includes(eventUserId)) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const sync = await GoogleCalendarSync.findOne({ userId: calendarEvent.userId });
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

                // eslint-disable-next-line no-await-in-loop
                await CardCalendarEvent.qm.deleteOne(calendarEvent.id);
              } catch (err) {
                if (err === 'tokenRefreshFailed' || (err && err.code === 'tokenRefreshFailed')) {
                  sails.log.warn(
                    `[Card Update] Google Calendar token decryption failed for user ${calendarEvent.userId}. User needs to reconnect their Google Calendar account.`,
                  );
                } else {
                  sails.log.error(
                    `[Card Update] Error deleting calendar event for user ${calendarEvent.userId}:`,
                    err,
                  );
                }
              }
            } else {
              // eslint-disable-next-line no-await-in-loop
              await CardCalendarEvent.qm.deleteOne(calendarEvent.id);
            }
          } catch (err) {
            sails.log.error('[Card Update] Error checking Google Calendar sync:', err);
          }
        }
      }

      if (cardMemberships.length > 0) {
        // eslint-disable-next-line no-restricted-syntax
        for (const membership of cardMemberships) {
          // eslint-disable-next-line no-await-in-loop
          const sync = await GoogleCalendarSync.qm.getOneByUserId(membership.userId);
          if (sync && sync.isEnabled) {
            try {
              // eslint-disable-next-line no-await-in-loop
              await sails.helpers.googleCalendar.syncCard.with({
                card,
                userId: String(membership.userId),
                sync,
              });
            } catch (err) {
              if (err === 'tokenRefreshFailed' || (err && err.code === 'tokenRefreshFailed')) {
                sails.log.warn(
                  `[Card Update] Google Calendar token decryption failed for user ${membership.userId}. User needs to reconnect their Google Calendar account.`,
                );
              } else if (err !== 'noDate' && err !== 'cardNotAssigned') {
                sails.log.error('Error syncing card to Google Calendar:', err);
              }
            }
          }
        }
      }
    }

    if (card && !_.isEmpty(values)) {
      try {
        await sails.helpers.cards.syncLinkedCard.with({
          sourceCard: card,
          changedValues: values,
        });
      } catch (err) {
        sails.log.error('[Card Sync] Error syncing linked card:', err);
      }
    }

    return card;
  },
};
