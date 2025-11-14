/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/releases:
 *   post:
 *     summary: Create a new release
 *     description: Creates a new release for the specified board.
 *     tags:
 *       - Board Releases
 *     operationId: createBoardRelease
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the board
 *         example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - version
 *               - name
 *             properties:
 *               version:
 *                 type: string
 *                 maxLength: 50
 *                 description: Version string for the release
 *                 example: "v1.0.0"
 *               name:
 *                 type: string
 *                 maxLength: 255
 *                 description: Name for the release
 *                 example: "Authentication - Signup"
 *               target:
 *                 type: string
 *                 nullable: true
 *                 description: Target/goal description
 *                 example: "Complete signup flow"
 *               status:
 *                 type: string
 *                 enum: [planning, in_progress, testing, completed, released, cancelled]
 *                 default: planning
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               cardIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Release created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/BoardRelease'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */

module.exports = {
  inputs: {
    boardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    version: {
      type: 'string',
      maxLength: 50,
      required: true,
    },
    name: {
      type: 'string',
      maxLength: 255,
      required: true,
    },
    target: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    status: {
      type: 'string',
      isIn: Object.values(BoardRelease.Statuses),
      defaultsTo: BoardRelease.Statuses.PLANNING,
    },
    startDate: {
      type: 'string',
      allowNull: true,
    },
    endDate: {
      type: 'string',
      allowNull: true,
    },
    cardIds: {
      type: 'json',
      custom: (value) => {
        if (!value) return true;
        if (Array.isArray(value)) {
          return value.every((id) => typeof id === 'string');
        }
        return false;
      },
      defaultsTo: [],
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    let cardIds = inputs.cardIds || [];
    const allParams = this.req.allParams();
    if (allParams['cardIds[]']) {
      cardIds = Array.isArray(allParams['cardIds[]'])
        ? allParams['cardIds[]']
        : [allParams['cardIds[]']];
    }

    const board = await Board.findOne(inputs.boardId);

    if (!board) {
      throw 'notFound';
    }

    // Check if user has access to the board
    const boardMembership = await BoardMembership.findOne({
      boardId: inputs.boardId,
      userId: currentUser.id,
    });

    const project = await Project.findOne(board.projectId).populate('managerUsers');
    const isProjectManager =
      project && project.managerUsers.some((managerUser) => managerUser.id === currentUser.id);

    const canEdit =
      isProjectManager ||
      currentUser.role === User.Roles.ADMIN ||
      (boardMembership && boardMembership.role === BoardMembership.Roles.EDITOR);

    if (!canEdit) {
      throw 'forbidden';
    }

    // Check if version already exists for this board
    const existingRelease = await BoardRelease.findOne({
      boardId: inputs.boardId,
      version: inputs.version,
    });

    if (existingRelease) {
      throw {
        name: 'conflict',
        message: 'Release with this version already exists',
      };
    }

    // Validate that all card IDs exist and belong to the board
    if (cardIds && cardIds.length > 0) {
      const cards = await Card.find({ id: cardIds });

      if (cards.length !== cardIds.length) {
        throw {
          name: 'badRequest',
          message: 'Some card IDs are invalid',
        };
      }

      const invalidCards = cards.filter((card) => card.boardId !== inputs.boardId);
      if (invalidCards.length > 0) {
        throw {
          name: 'badRequest',
          message: 'Some cards do not belong to this board',
        };
      }
    }

    const values = {
      version: inputs.version,
      name: inputs.name,
      target: inputs.target,
      status: inputs.status || BoardRelease.Statuses.PLANNING,
      boardId: inputs.boardId,
    };

    if (inputs.startDate) {
      const startDate = new Date(inputs.startDate);
      if (Number.isNaN(startDate.getTime())) {
        throw {
          name: 'badRequest',
          message: 'Invalid start date',
        };
      }
      values.startDate = startDate;
    }

    if (inputs.endDate) {
      const endDate = new Date(inputs.endDate);
      if (Number.isNaN(endDate.getTime())) {
        throw {
          name: 'badRequest',
          message: 'Invalid end date',
        };
      }
      values.endDate = endDate;
    }

    const release = await BoardRelease.create(values).fetch();

    const createdReleaseCards = [];
    if (cardIds && cardIds.length > 0) {
      const releaseCardPromises = cardIds.map((cardId) =>
        ReleaseCard.create({
          releaseId: release.id,
          cardId,
        }).fetch(),
      );
      createdReleaseCards.push(...(await Promise.all(releaseCardPromises)));
    }

    const cards = await Card.find({ id: cardIds || [] });

    const epics = cards.filter((card) => card.type === Card.Types.EPIC);
    const stories = cards.filter((card) => card.type === Card.Types.STORY);
    const regularCards = cards.filter(
      (card) => card.type !== Card.Types.EPIC && card.type !== Card.Types.STORY,
    );

    const releaseWithDetails = {
      ...release,
      epics: epics.map((epic) => ({
        id: epic.id,
        name: epic.name,
        type: epic.type,
      })),
      stories: stories.map((story) => ({
        id: story.id,
        name: story.name,
        type: story.type,
      })),
      cards: regularCards.map((card) => ({
        id: card.id,
        name: card.name,
        type: card.type,
      })),
      epicsCount: epics.length,
      storiesCount: stories.length,
      cardsCount: regularCards.length,
      totalCount: cards.length,
    };

    return exits.success({
      item: releaseWithDetails,
      releaseCards: createdReleaseCards,
    });
  },
};
