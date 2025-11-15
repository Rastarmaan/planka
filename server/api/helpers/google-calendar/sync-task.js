/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    task: {
      type: 'ref',
      required: true,
    },
    sync: {
      type: 'ref',
      required: true,
    },
  },

  exits: {
    noDate: {},
    taskNotAssigned: {},
    tokenRefreshFailed: {},
  },

  async fn(inputs) {
    const { task, sync } = inputs;

    if (!task.assigneeUserId) {
      throw 'taskNotAssigned';
    }

    if (task.assigneeUserId !== sync.userId) {
      return;
    }

    let card = null;
    if (task.linkedCardId) {
      card = await Card.qm.getOneById(task.linkedCardId);
    }

    if (!card || (!card.startDate && !card.dueDate)) {
      throw 'noDate';
    }

    if (task.isCompleted) {
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
          sails.log.error('Error deleting calendar event:', err);
        }
      }
      return;
    }

    const { calendar, calendarId } = await sails.helpers.googleCalendar.getClient({
      sync,
    });

    const eventTitle = task.name;
    const eventDescription = card.description
      ? `${card.description}\n\nView in Planka: ${sails.config.custom.baseUrl}`
      : `View in Planka: ${sails.config.custom.baseUrl}`;

    const startDate = card.startDate ? new Date(card.startDate) : new Date(card.dueDate);
    const endDate = card.dueDate
      ? new Date(card.dueDate)
      : new Date(startDate.getTime() + 60 * 60 * 1000);

    const existingEvent = await TaskCalendarEvent.qm.getOneByTaskId(task.id);

    const eventData = {
      summary: eventTitle,
      description: eventDescription,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'UTC',
      },
    };

    let eventId;
    if (existingEvent) {
      const updatedEvent = await calendar.events.update({
        calendarId,
        eventId: existingEvent.eventId,
        requestBody: eventData,
      });

      eventId = updatedEvent.data.id;
    } else {
      const createdEvent = await calendar.events.insert({
        calendarId,
        requestBody: eventData,
      });

      eventId = createdEvent.data.id;

      await TaskCalendarEvent.qm.createOne({
        taskId: task.id,
        syncId: sync.id,
        eventId,
        calendarId,
      });
    }

    await GoogleCalendarSync.qm.updateOne(sync.id, {
      lastSyncAt: new Date(),
    });
  },
};
