/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    projectId: {
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
    const { projectId, creatorUserId, name, description } = inputs;

    const project = await Project.findOne({ id: projectId });
    if (!project) {
      throw new Error('Project not found');
    }

    const boards = await Board.find({ projectId }).sort('position ASC');
    const boardIds = boards.map((board) => board.id);

    const lists =
      boardIds.length > 0
        ? await List.find({ boardId: { in: boardIds } }).sort('position ASC')
        : [];

    const cards =
      boardIds.length > 0
        ? await Card.find({ boardId: { in: boardIds } }).sort('position ASC')
        : [];
    const cardIds = cards.map((card) => card.id);

    const labels =
      boardIds.length > 0
        ? await Label.find({ boardId: { in: boardIds } }).sort('position ASC')
        : [];

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

    const boardMemberships =
      boardIds.length > 0 ? await BoardMembership.find({ boardId: { in: boardIds } }) : [];

    const projectManagers = await ProjectManager.find({ projectId });

    const snapshotData = {
      project: {
        ...project,
        createdAt: null,
        updatedAt: null,
      },
      boards: boards.map((board) => ({
        ...board,
        createdAt: null,
        updatedAt: null,
      })),
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
      boardMemberships,
      projectManagers,
    };

    const metadata = {
      boardCount: boards.length,
      cardCount: cards.length,
      listCount: lists.length,
      labelCount: labels.length,
      attachmentCount: attachments.length,
      commentCount: comments.length,
      taskCount: tasks.length,
    };

    const projectVersion = await ProjectVersion.create({
      projectId,
      creatorUserId,
      name: name || `Version ${new Date().toISOString()}`,
      description: description || null,
      snapshotData: JSON.stringify(snapshotData),
      metadata,
    }).fetch();

    if (inputs.request) {
      sails.sockets.broadcast(
        `project:${projectId}`,
        'projectVersionCreate',
        {
          item: projectVersion,
        },
        inputs.request,
      );
    }

    return projectVersion;
  },
};
