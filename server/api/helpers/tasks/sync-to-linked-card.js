/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Helper to sync a task to the linked card
 */

module.exports = {
  inputs: {
    task: {
      type: 'ref',
      required: true,
      description: 'The task that was created or updated',
    },
    card: {
      type: 'ref',
      required: true,
      description: 'The card the task belongs to',
    },
    action: {
      type: 'string',
      isIn: ['create', 'update', 'delete'],
      defaultsTo: 'create',
      description: 'The action performed on the task',
    },
  },

  async fn(inputs) {
    const { task, card, action } = inputs;

    if (!card.isSyncEnabled || !card.syncedFromCardId) {
      return;
    }

    const linkedCard = await Card.qm.getOneById(card.syncedFromCardId);
    if (!linkedCard || !linkedCard.isSyncEnabled) {
      return;
    }

    const originalSyncEnabled = linkedCard.isSyncEnabled;
    await Card.update({ id: linkedCard.id }).set({ isSyncEnabled: false });

    try {
      if (action === 'create') {
        const taskList = await TaskList.qm.getOneById(task.taskListId);

        let linkedTaskList = await TaskList.findOne({
          cardId: linkedCard.id,
          name: taskList.name,
        });

        if (!linkedTaskList) {
          linkedTaskList = await sails.helpers.taskLists.createOne.with({
            card: linkedCard,
            values: {
              name: taskList.name,
            },
          });
        }

        const syncedTask = await sails.helpers.tasks.createOne.with({
          taskList: linkedTaskList,
          values: {
            name: task.name,
            isCompleted: task.isCompleted,
          },
        });

        sails.sockets.broadcast(`board:${linkedCard.boardId}`, 'taskCreate', {
          item: syncedTask,
        });

        sails.log.info(`[Task Sync] Synced task ${task.id} to linked card ${linkedCard.id}`);
      } else if (action === 'update') {
        const taskList = await TaskList.qm.getOneById(task.taskListId);
        const linkedTaskList = await TaskList.findOne({
          cardId: linkedCard.id,
          name: taskList.name,
        });

        if (linkedTaskList) {
          const linkedTask = await Task.findOne({
            taskListId: linkedTaskList.id,
            name: task.name,
          });

          if (linkedTask) {
            const updatedTask = await sails.helpers.tasks.updateOne.with({
              record: linkedTask,
              values: {
                name: task.name,
                isCompleted: task.isCompleted,
              },
            });

            sails.sockets.broadcast(`board:${linkedCard.boardId}`, 'taskUpdate', {
              item: updatedTask,
            });

            sails.log.info(
              `[Task Sync] Updated task ${linkedTask.id} on linked card ${linkedCard.id}`,
            );
          }
        }
      } else if (action === 'delete') {
        const taskList = await TaskList.qm.getOneById(task.taskListId);
        const linkedTaskList = await TaskList.findOne({
          cardId: linkedCard.id,
          name: taskList.name,
        });

        if (linkedTaskList) {
          const linkedTask = await Task.findOne({
            taskListId: linkedTaskList.id,
            name: task.name,
          });

          if (linkedTask) {
            await sails.helpers.tasks.deleteOne.with({
              record: linkedTask,
            });

            sails.sockets.broadcast(`board:${linkedCard.boardId}`, 'taskDelete', {
              item: { id: linkedTask.id },
            });

            sails.log.info(
              `[Task Sync] Deleted task ${linkedTask.id} from linked card ${linkedCard.id}`,
            );
          }
        }
      }
    } catch (error) {
      sails.log.error('[Task Sync] Error syncing task:', error);
    } finally {
      await Card.update({ id: linkedCard.id }).set({ isSyncEnabled: originalSyncEnabled });
    }
  },
};
