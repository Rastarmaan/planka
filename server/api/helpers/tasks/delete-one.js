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
    card: {
      type: 'ref',
      required: true,
    },
    taskList: {
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
    const task = await Task.qm.deleteOne(inputs.record.id);

    if (task) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'taskDelete',
        {
          item: task,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.TASK_DELETE,
        buildData: () => ({
          item: task,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
            cards: [inputs.card],
            taskLists: [inputs.taskList],
          },
        }),
        user: inputs.actorUser,
      });

      if (task.assigneeUserId) {
        const sync = await GoogleCalendarSync.qm.getOneByUserId(task.assigneeUserId);
        if (sync && sync.isEnabled) {
          const calendarEvent = await TaskCalendarEvent.qm.getOneByTaskId(task.id);
          if (calendarEvent) {
            try {
              const { calendar, calendarId } = await sails.helpers.googleCalendar.getClient({
                sync,
              });

              await calendar.events.delete({
                calendarId,
                eventId: calendarEvent.eventId,
              });

              await TaskCalendarEvent.qm.deleteOne(calendarEvent.id);
            } catch (err) {
              if (err === 'tokenRefreshFailed' || (err && err.code === 'tokenRefreshFailed')) {
                sails.log.warn(
                  `[Task Delete] Google Calendar token decryption failed for user ${task.assigneeUserId}. User needs to reconnect their Google Calendar account.`,
                );
              } else {
                sails.log.error('Error deleting calendar event:', err);
              }
            }
          }
        }
      }
    }

    if (task) {
      try {
        await sails.helpers.tasks.syncToLinkedCard.with({
          task,
          card: inputs.card,
          action: 'delete',
        });
      } catch (err) {
        sails.log.error('[Task Sync] Error syncing task deletion to linked card:', err);
      }
    }

    return task;
  },
};
