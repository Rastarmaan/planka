/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Helper to create a snapshot of board state for a specific release
 * Only includes cards that are part of the release
 */

module.exports = {
  inputs: {
    boardId: {
      type: 'string',
      required: true,
    },
    releaseId: {
      type: 'string',
      required: true,
    },
    creatorUserId: {
      type: 'string',
      required: true,
    },
    releaseName: {
      type: 'string',
      required: true,
    },
    releaseVersion: {
      type: 'string',
      required: true,
    },
    requestId: {
      type: 'string',
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { boardId, releaseId, creatorUserId, releaseName, releaseVersion } = inputs;

    const board = await Board.findOne({ id: boardId });
    if (!board) {
      throw new Error('Board not found');
    }

    const release = await BoardRelease.findOne({ id: releaseId });
    if (!release) {
      throw new Error('Release not found');
    }

    const releaseCards = await ReleaseCard.find({ releaseId });
    const cardIds = releaseCards.map((rc) => rc.cardId);

    if (cardIds.length === 0) {
      const boardVersion = await BoardVersion.create({
        boardId,
        creatorUserId,
        name: `Release: ${releaseName} (${releaseVersion})`,
        description: `Automatic snapshot created when release was marked as released. No cards in this release.`,
        snapshotData: JSON.stringify({
          board: { ...board, createdAt: null, updatedAt: null },
          release: { ...release, createdAt: null, updatedAt: null },
          lists: [],
          cards: [],
          labels: [],
          attachments: [],
          comments: [],
          cardMemberships: [],
          cardLabels: [],
          taskLists: [],
          tasks: [],
        }),
        metadata: {
          releaseId: release.id,
          releaseVersion: release.version,
          releaseName: release.name,
          cardCount: 0,
        },
        isAutoCreated: true,
      }).fetch();

      return boardVersion;
    }

    const cards = await Card.find({ id: { in: cardIds } }).sort('position ASC');

    const listIds = [...new Set(cards.map((card) => card.listId))];
    const lists = await List.find({ id: { in: listIds } }).sort('position ASC');

    const cardLabels = await CardLabel.find({ cardId: { in: cardIds } });
    const labelIds = [...new Set(cardLabels.map((cl) => cl.labelId))];
    const labels = labelIds.length > 0 ? await Label.find({ id: { in: labelIds } }) : [];

    const attachments = await Attachment.find({ cardId: { in: cardIds } });

    const comments = await Comment.find({ cardId: { in: cardIds } }).sort('createdAt ASC');

    const cardMemberships = await CardMembership.find({ cardId: { in: cardIds } });

    const taskLists = await TaskList.find({ cardId: { in: cardIds } });
    const taskListIds = taskLists.map((taskList) => taskList.id);
    const tasks =
      taskListIds.length > 0
        ? await Task.find({ taskListId: { in: taskListIds } }).sort('position ASC')
        : [];

    const dependencies = await CardDependency.find({
      or: [{ cardId: { in: cardIds } }, { dependsOnCardId: { in: cardIds } }],
    });

    const snapshotData = {
      board: {
        ...board,
        createdAt: null,
        updatedAt: null,
      },
      release: {
        ...release,
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
      dependencies: dependencies.map((dep) => ({
        ...dep,
        createdAt: null,
        updatedAt: null,
      })),
    };

    const boardVersion = await BoardVersion.create({
      boardId,
      creatorUserId,
      name: `Release: ${releaseName} (${releaseVersion})`,
      description: `Automatic snapshot created when release was marked as released`,
      snapshotData: JSON.stringify(snapshotData),
      metadata: {
        releaseId: release.id,
        releaseVersion: release.version,
        releaseName: release.name,
        cardCount: cards.length,
        listCount: lists.length,
        attachmentCount: attachments.length,
        commentCount: comments.length,
      },
      isAutoCreated: true,
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
