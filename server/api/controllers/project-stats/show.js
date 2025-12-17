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
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    notFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser || !['admin', 'manager'].includes(currentUser.role)) {
      throw 'notEnoughRights';
    }

    const project = await Project.findOne({ id: inputs.projectId });

    if (!project) {
      throw 'notFound';
    }

    const boards = await Board.find({ projectId: project.id }).select(['id', 'name']);
    const boardIds = boards.map((board) => board.id);

    const lists =
      boardIds.length > 0
        ? await List.find({ boardId: boardIds }).select(['id', 'boardId', 'name'])
        : [];

    const boardMemberships =
      boardIds.length > 0
        ? await BoardMembership.find({ boardId: boardIds }).select(['boardId', 'userId'])
        : [];

    const releases =
      boardIds.length > 0
        ? await BoardRelease.find({ boardId: boardIds }).select([
            'id',
            'name',
            'version',
            'status',
            'boardId',
            'startDate',
            'endDate',
            'releasedAt',
          ])
        : [];

    const cards =
      boardIds.length > 0
        ? await Card.find({ boardId: boardIds }).select([
            'id',
            'boardId',
            'listId',
            'isDueCompleted',
            'isClosed',
            'startDate',
            'dueDate',
          ])
        : [];

    const now = Date.now();

    const boardsById = boards.reduce((acc, board) => {
      acc[board.id] = {
        id: board.id,
        name: board.name,
        members: new Set(),
        releases: [],
        doneListIds: new Set(),
        cards: {
          total: 0,
          done: 0,
          delayed: 0,
          withoutStartDate: 0,
          withoutDueDate: 0,
          withoutDates: 0,
        },
      };
      return acc;
    }, {});

    lists.forEach((list) => {
      const boardStats = boardsById[list.boardId];

      if (!boardStats) {
        return;
      }

      if (list.name && list.name.toLowerCase() === 'done') {
        boardStats.doneListIds.add(list.id);
      }
    });

    boardMemberships.forEach((membership) => {
      const boardStats = boardsById[membership.boardId];

      if (!boardStats) {
        return;
      }

      if (membership.userId) {
        boardStats.members.add(membership.userId);
      }
    });

    releases.forEach((release) => {
      const boardStats = boardsById[release.boardId];

      if (!boardStats) {
        return;
      }

      boardStats.releases.push({
        ...release,
        boardId: release.boardId,
      });
    });

    cards.forEach((card) => {
      const boardStats = boardsById[card.boardId];

      if (!boardStats) {
        return;
      }

      boardStats.cards.total += 1;

      const isDoneList = boardStats.doneListIds.has(card.listId);
      if (isDoneList) {
        boardStats.cards.done += 1;
      }

      const missingStart = !card.startDate;
      const missingDue = !card.dueDate;

      if (missingStart) {
        boardStats.cards.withoutStartDate += 1;
      }

      if (missingDue) {
        boardStats.cards.withoutDueDate += 1;
      }

      if (missingStart || missingDue) {
        boardStats.cards.withoutDates += 1;
      }

      const isDelayed =
        card.dueDate &&
        !isDoneList &&
        new Date(card.dueDate).getTime() < now &&
        card.isClosed === false;

      if (isDelayed) {
        boardStats.cards.delayed += 1;
      }
    });

    const boardStatsArray = Object.values(boardsById);

    const membersTotal = new Set(
      boardMemberships.map((membership) => membership.userId).filter(Boolean),
    ).size;

    const finalBoardStats = boardStatsArray.map((boardStats) => ({
      id: boardStats.id,
      name: boardStats.name,
      membersTotal: boardStats.members.size,
      releases: boardStats.releases,
      releasesTotal: boardStats.releases.length,
      cards: boardStats.cards,
    }));

    const totals = finalBoardStats.reduce(
      (acc, boardStats) => ({
        doneCardsTotal: acc.doneCardsTotal + boardStats.cards.done,
        delayedCardsTotal: acc.delayedCardsTotal + boardStats.cards.delayed,
        withoutDatesTotal: acc.withoutDatesTotal + boardStats.cards.withoutDates,
      }),
      { doneCardsTotal: 0, delayedCardsTotal: 0, withoutDatesTotal: 0 },
    );

    return {
      project: {
        id: project.id,
        name: project.name,
      },
      summary: {
        boardsTotal: boards.length,
        membersTotal,
        releasesTotal: releases.length,
        doneCardsTotal: totals.doneCardsTotal,
        delayedCardsTotal: totals.delayedCardsTotal,
        withoutDatesTotal: totals.withoutDatesTotal,
      },
      boards: finalBoardStats,
    };
  },
};
