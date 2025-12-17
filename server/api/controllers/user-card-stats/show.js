/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn() {
    const { currentUser } = this.req;

    if (!currentUser) {
      throw 'notEnoughRights';
    }

    const memberships = await CardMembership.find({ userId: currentUser.id });

    if (memberships.length === 0) {
      return { cards: [] };
    }

    const cardIds = memberships.map((m) => m.cardId);

    const cards = await Card.find({ id: cardIds }).select([
      'id',
      'name',
      'boardId',
      'listId',
      'dueDate',
      'isClosed',
    ]);

    const boardIds = Array.from(new Set(cards.map((c) => c.boardId).filter(Boolean)));
    const listIds = Array.from(new Set(cards.map((c) => c.listId).filter(Boolean)));
    const boards =
      boardIds.length > 0
        ? await Board.find({ id: boardIds }).select(['id', 'name', 'projectId'])
        : [];
    const projectIds = Array.from(new Set(boards.map((b) => b.projectId).filter(Boolean)));
    const projects =
      projectIds.length > 0 ? await Project.find({ id: projectIds }).select(['id', 'name']) : [];

    const lists = listIds.length > 0 ? await List.find({ id: listIds }).select(['id', 'name']) : [];

    const boardMetaById = boards.reduce((acc, board) => {
      acc[board.id] = { name: board.name, projectId: board.projectId };
      return acc;
    }, {});

    const projectNameById = projects.reduce((acc, project) => {
      acc[project.id] = project.name;
      return acc;
    }, {});

    const listNameById = lists.reduce((acc, list) => {
      acc[list.id] = list.name;
      return acc;
    }, {});

    const decorated = cards.map((card) => {
      const boardMeta = boardMetaById[card.boardId] || {};
      const projectName = boardMeta.projectId ? projectNameById[boardMeta.projectId] || null : null;

      return {
        id: card.id,
        name: card.name,
        boardId: card.boardId,
        boardName: boardMeta.name || null,
        projectId: boardMeta.projectId || null,
        projectName,
        listId: card.listId,
        listName: listNameById[card.listId] || null,
        dueDate: card.dueDate,
        isClosed: card.isClosed,
      };
    });

    return {
      cards: decorated,
    };
  },
};
