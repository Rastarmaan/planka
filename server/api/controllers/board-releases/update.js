/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/releases/{id}:
 *   put:
 *     summary: Update a release
 *     description: Updates an existing release for the specified board.
 *     tags:
 *       - Board Releases
 *     operationId: updateBoardRelease
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the board
 *         example: "1357158568008091264"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the release
 *         example: "1357158568008091265"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               version:
 *                 type: string
 *                 maxLength: 50
 *                 description: Version string for the release
 *                 example: "1.2.5"
 *               name:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *                 description: Optional name for the release
 *                 example: "Spring 2024 Release - Updated"
 *               description:
 *                 type: string
 *                 maxLength: 1024
 *                 nullable: true
 *                 description: Detailed description of the release
 *                 example: "This release includes updated features..."
 *               targetDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Target date for the release
 *                 example: "2024-03-20T10:00:00.000Z"
 *     responses:
 *       200:
 *         description: Release updated successfully
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
 *       403:
 *         $ref: '#/components/responses/Forbidden'
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
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    version: {
      type: 'string',
      maxLength: 50,
    },
    name: {
      type: 'string',
      maxLength: 255,
    },
    target: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    status: {
      type: 'string',
      isIn: Object.values(BoardRelease.Statuses),
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
      custom: (value) => Array.isArray(value) && value.every((id) => typeof id === 'string'),
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const board = await Board.findOne(inputs.boardId);

    if (!board) {
      throw 'notFound';
    }

    const project = await Project.findOne(board.projectId).populate('managerUsers');

    if (!project) {
      throw 'notFound';
    }

    const boardMembership = await BoardMembership.findOne({
      boardId: inputs.boardId,
      userId: currentUser.id,
    });

    const isProjectManager = project.managerUsers.some(
      (managerUser) => managerUser.id === currentUser.id,
    );

    const canEdit =
      isProjectManager ||
      User.isAdminLevel(currentUser) ||
      (boardMembership && boardMembership.role === BoardMembership.Roles.EDITOR);

    if (!canEdit) {
      throw 'forbidden';
    }

    const release = await BoardRelease.findOne({
      id: inputs.id,
      boardId: inputs.boardId,
    });

    if (!release) {
      throw 'notFound';
    }

    if (release.status === BoardRelease.Statuses.RELEASED) {
      throw new Error('Cannot modify released releases');
    }

    if (inputs.version && inputs.version !== release.version) {
      const existingRelease = await BoardRelease.findOne({
        boardId: inputs.boardId,
        version: inputs.version,
        id: { '!=': inputs.id },
      });

      if (existingRelease) {
        throw new Error('Release with this version already exists');
      }
    }

    if (inputs.cardIds !== undefined) {
      if (inputs.cardIds.length > 0) {
        const cards = await Card.find({ id: inputs.cardIds }).populate('list');

        if (cards.length !== inputs.cardIds.length) {
          throw new Error('Some card IDs are invalid');
        }

        const invalidCards = cards.filter((card) => card.list.boardId !== inputs.boardId);
        if (invalidCards.length > 0) {
          throw new Error('Some cards do not belong to this board');
        }
      }

      await ReleaseCard.destroy({ releaseId: inputs.id });

      if (inputs.cardIds.length > 0) {
        await Promise.all(
          inputs.cardIds.map((cardId) =>
            ReleaseCard.create({
              releaseId: inputs.id,
              cardId,
            }),
          ),
        );
      }
    }

    const values = _.pick(inputs, ['version', 'name', 'target', 'status', 'startDate', 'endDate']);

    if (inputs.startDate !== undefined) {
      if (inputs.startDate) {
        const startDate = new Date(inputs.startDate);
        if (Number.isNaN(startDate.getTime())) {
          throw new Error('Invalid start date');
        }
        values.startDate = startDate;
      } else {
        values.startDate = null;
      }
    }

    if (inputs.endDate !== undefined) {
      if (inputs.endDate) {
        const endDate = new Date(inputs.endDate);
        if (Number.isNaN(endDate.getTime())) {
          throw new Error('Invalid end date');
        }
        values.endDate = endDate;
      } else {
        values.endDate = null;
      }
    }

    const updatedRelease = await BoardRelease.updateOne({
      id: inputs.id,
      boardId: inputs.boardId,
    }).set(values);

    sails.sockets.broadcast(
      `board:${inputs.boardId}`,
      'boardReleaseUpdate',
      {
        item: updatedRelease,
      },
      this.req,
    );

    return exits.success({
      item: updatedRelease,
    });
  },
};
