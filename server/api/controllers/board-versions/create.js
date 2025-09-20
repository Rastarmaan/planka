/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/versions:
 *   post:
 *     summary: Create board version
 *     description: Creates a snapshot version of the current board state. Requires board member permissions.
 *     tags:
 *       - Board Versions
 *     operationId: createBoardVersion
 *     parameters:
 *       - name: boardId
 *         in: path
 *         required: true
 *         description: ID of the board to create a version for
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional description for this version
 *                 example: "Before major restructuring"
 *     responses:
 *       201:
 *         description: Board version created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/BoardVersion'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Board not found
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    boardId: {
      ...idInput,
      required: true,
    },
    name: {
      type: 'string',
      maxLength: 255,
      defaultsTo: '',
    },
    description: {
      type: 'string',
      maxLength: 500,
      defaultsTo: '',
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers.boards
      .getPathToProjectById(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
        const isProjectManager = await sails.helpers.users.isProjectManager(
          currentUser.id,
          project.id,
        );

        if (!isProjectManager) {
          throw Errors.BOARD_NOT_FOUND;
        }
      }
    }

    const boardVersion = await sails.helpers.boardVersions.createSnapshot.with({
      boardId: inputs.boardId,
      creatorUserId: currentUser.id,
      name: inputs.name,
      description: inputs.description,
      requestId: inputs.requestId,
      request: this.req,
    });

    return {
      item: boardVersion,
    };
  },
};
