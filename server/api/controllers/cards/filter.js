/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/filter:
 *   get:
 *     summary: Filter cards across projects
 *     description: Retrieves cards matching filter criteria with permission-based access control
 *     tags:
 *       - Cards
 *     operationId: filterCards
 *     parameters:
 *       - name: projectIds
 *         in: query
 *         required: false
 *         description: Comma-separated project IDs to filter by
 *         schema:
 *           type: string
 *           example: "id1,id2,id3"
 *       - name: userIds
 *         in: query
 *         required: false
 *         description: Comma-separated user IDs to filter by card members
 *         schema:
 *           type: string
 *           example: "userId1,userId2"
 *       - name: labelIds
 *         in: query
 *         required: false
 *         description: Comma-separated label IDs to filter by
 *         schema:
 *           type: string
 *           example: "labelId1,labelId2"
 *       - name: cardType
 *         in: query
 *         required: false
 *         description: Card type to filter (project, story, epic)
 *         schema:
 *           type: string
 *           enum: [project, story, epic]
 *           example: project
 *       - name: startDateFrom
 *         in: query
 *         required: false
 *         description: Filter cards with start date >= this value
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: startDateTo
 *         in: query
 *         required: false
 *         description: Filter cards with start date <= this value
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: dueDateFrom
 *         in: query
 *         required: false
 *         description: Filter cards with due date >= this value
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: dueDateTo
 *         in: query
 *         required: false
 *         description: Filter cards with due date <= this value
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: weightFrom
 *         in: query
 *         required: false
 *         description: Filter cards with weight >= this value
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *       - name: weightTo
 *         in: query
 *         required: false
 *         description: Filter cards with weight <= this value
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *     responses:
 *       200:
 *         description: Filtered cards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Card'
 *                 included:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *                     boards:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Board'
 *                     lists:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/List'
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     labels:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Label'
 *                     cardMemberships:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CardMembership'
 *                     cardLabels:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CardLabel'
 */

module.exports = async function filterCards(req, res) {
  const { currentUser } = req;

  const projectIds = req.query.projectIds ? req.query.projectIds.split(',') : null;
  const userIds = req.query.userIds ? req.query.userIds.split(',') : null;
  const labelIds = req.query.labelIds ? req.query.labelIds.split(',') : null;
  const cardType = req.query.cardType || null;
  const startDateFrom = req.query.startDateFrom ? new Date(req.query.startDateFrom) : null;
  const startDateTo = req.query.startDateTo ? new Date(req.query.startDateTo) : null;
  const dueDateFrom = req.query.dueDateFrom ? new Date(req.query.dueDateFrom) : null;
  const dueDateTo = req.query.dueDateTo ? new Date(req.query.dueDateTo) : null;
  const weightFrom = req.query.weightFrom ? parseInt(req.query.weightFrom, 10) : null;
  const weightTo = req.query.weightTo ? parseInt(req.query.weightTo, 10) : null;

  let accessibleProjectIds;
  if (currentUser.role === User.Roles.ADMIN) {
    const allProjects = await Project.find();
    accessibleProjectIds = allProjects.map((p) => p.id);
  } else {
    const projectManagers = await ProjectManager.find({
      userId: currentUser.id,
    });
    const managerProjectIds = projectManagers.map((pm) => pm.projectId);

    const boardMemberships = await BoardMembership.find({
      userId: currentUser.id,
    });
    const boardIds = boardMemberships.map((bm) => bm.boardId);
    const boards = await Board.find({
      id: boardIds,
    });
    const memberProjectIds = boards.map((b) => b.projectId);

    accessibleProjectIds = [...new Set([...managerProjectIds, ...memberProjectIds])];
  }

  let filteredProjectIds = accessibleProjectIds;
  if (projectIds && projectIds.length > 0) {
    filteredProjectIds = accessibleProjectIds.filter((id) => projectIds.includes(id));
  }

  if (filteredProjectIds.length === 0) {
    return res.ok({
      items: [],
      included: {
        projects: [],
        boards: [],
        lists: [],
        users: [],
        labels: [],
        cardMemberships: [],
        cardLabels: [],
      },
    });
  }

  const accessibleBoards = await Board.find({
    projectId: filteredProjectIds,
  });
  const accessibleBoardIds = accessibleBoards.map((b) => b.id);

  const nonTrashLists = await List.find({
    boardId: accessibleBoardIds,
    type: { '!=': List.Types.TRASH },
  });
  const nonTrashListIds = nonTrashLists.map((l) => l.id);

  const cardQuery = {
    listId: nonTrashListIds,
  };

  if (cardType) {
    cardQuery.type = cardType;
  }

  if (startDateFrom) {
    cardQuery.startDate = cardQuery.startDate || {};
    cardQuery.startDate['>='] = startDateFrom;
  }
  if (startDateTo) {
    cardQuery.startDate = cardQuery.startDate || {};
    cardQuery.startDate['<='] = startDateTo;
  }

  if (dueDateFrom) {
    cardQuery.dueDate = cardQuery.dueDate || {};
    cardQuery.dueDate['>='] = dueDateFrom;
  }
  if (dueDateTo) {
    cardQuery.dueDate = cardQuery.dueDate || {};
    cardQuery.dueDate['<='] = dueDateTo;
  }

  if (weightFrom) {
    cardQuery.weight = cardQuery.weight || {};
    cardQuery.weight['>='] = weightFrom;
  }
  if (weightTo) {
    cardQuery.weight = cardQuery.weight || {};
    cardQuery.weight['<='] = weightTo;
  }

  let cards = await Card.find(cardQuery).sort('createdAt DESC').limit(100);

  if (userIds && userIds.length > 0) {
    const cardIdsWithUsers = await CardMembership.find({
      userId: { in: userIds },
    }).then((memberships) => memberships.map((m) => m.cardId));

    cards = cards.filter((card) => cardIdsWithUsers.includes(card.id));
  }

  if (labelIds && labelIds.length > 0) {
    const cardIdsWithLabels = await CardLabel.find({
      labelId: { in: labelIds },
    }).then((cardLabels) => cardLabels.map((cl) => cl.cardId));

    cards = cards.filter((card) => cardIdsWithLabels.includes(card.id));
  }

  const cardIds = cards.map((c) => c.id);

  const projects = await Project.find({
    id: filteredProjectIds,
  });

  const boards = await Board.find({
    id: accessibleBoardIds,
  });

  const lists = await List.find({
    boardId: accessibleBoardIds,
  });

  const cardMemberships = await CardMembership.find({
    cardId: cardIds,
  });

  const cardLabels = await CardLabel.find({
    cardId: cardIds,
  });

  const relatedUserIds = [...new Set(cardMemberships.map((cm) => cm.userId))];
  const users = relatedUserIds.length > 0 ? await User.find({ id: relatedUserIds }) : [];

  const labelIdsInCards = [...new Set(cardLabels.map((cl) => cl.labelId))];
  const labels = await Label.find({
    id: labelIdsInCards,
  });

  return res.ok({
    items: cards,
    included: {
      projects,
      boards,
      lists,
      users,
      labels,
      cardMemberships,
      cardLabels,
    },
  });
};
