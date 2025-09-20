/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    boardId: {
      type: 'string',
      required: true,
    },
    creatorUserId: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
      defaultsTo: '',
    },
    description: {
      type: 'string',
      defaultsTo: '',
    },
    requestId: {
      type: 'string',
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { boardId, creatorUserId, name, description } = inputs;

    const board = await Board.findOne({ id: boardId });
    if (!board) {
      throw new Error('Board not found');
    }

    const lists = await List.find({ boardId }).sort('position ASC');

    const cards = await Card.find({ boardId }).sort('position ASC');

    const labels = await Label.find({ boardId }).sort('position ASC');

    const cardIds = cards.map((card) => card.id);
    const attachments =
      cardIds.length > 0 ? await Attachment.find({ cardId: { in: cardIds } }) : [];

    const comments =
      cardIds.length > 0
        ? await Comment.find({ cardId: { in: cardIds } }).sort('createdAt ASC')
        : [];

    const cardMemberships =
      cardIds.length > 0 ? await CardMembership.find({ cardId: { in: cardIds } }) : [];

    const cardLabels = cardIds.length > 0 ? await CardLabel.find({ cardId: { in: cardIds } }) : [];

    const taskLists = cardIds.length > 0 ? await TaskList.find({ cardId: { in: cardIds } }) : [];
    const taskListIds = taskLists.map((taskList) => taskList.id);

    const tasks =
      taskListIds.length > 0
        ? await Task.find({ taskListId: { in: taskListIds } }).sort('position ASC')
        : [];

    const snapshotData = {
      board: {
        ...board,
        createdAt: null,
        updatedAt: null,
      },
      lists: lists.map((list) => ({
        ...list,
        createdAt: null,
        updatedAt: null,
      })),
      cards: cards.map((card) => ({
        ...card,
        createdAt: null,
        updatedAt: null,
      })),
      labels: labels.map((label) => ({
        ...label,
        createdAt: null,
        updatedAt: null,
      })),
      attachments: attachments.map((attachment) => ({
        ...attachment,
        createdAt: null,
        updatedAt: null,
      })),
      comments: comments.map((comment) => ({
        ...comment,
        createdAt: null,
        updatedAt: null,
      })),
      cardMemberships,
      cardLabels,
      taskLists: taskLists.map((taskList) => ({
        ...taskList,
        createdAt: null,
        updatedAt: null,
      })),
      tasks: tasks.map((task) => ({
        ...task,
        createdAt: null,
        updatedAt: null,
      })),
    };

    const boardVersion = await BoardVersion.create({
      boardId,
      creatorUserId,
      name: name || `Version ${new Date().toISOString()}`,
      description: description || null,
      snapshotData: JSON.stringify(snapshotData),
    }).fetch();

    if (inputs.request) {
      sails.sockets.broadcast(
        `board:${boardId}`,
        'boardVersionCreate',
        {
          item: boardVersion,
        },
        inputs.request,
      );
    }

    return boardVersion;
  },
};
