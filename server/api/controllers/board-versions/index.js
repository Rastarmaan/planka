/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/versions:
 *   get:
 *     summary: List board versions
 *     description: Retrieves all versions for a specific board. Requires board member permissions.
 *     tags:
 *       - Board Versions
 *     operationId: listBoardVersions
 *     parameters:
 *       - name: boardId
 *         in: path
 *         required: true
 *         description: ID of the board to list versions for
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Maximum number of versions to return
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - name: offset
 *         in: query
 *         required: false
 *         description: Number of versions to skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: Board versions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BoardVersion'
 *                 total:
 *                   type: integer
 *                   description: Total number of versions available
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
    limit: {
      type: 'number',
      min: 1,
      max: 100,
      defaultsTo: 20,
    },
    offset: {
      type: 'number',
      min: 0,
      defaultsTo: 0,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { board } = await sails.helpers.boards
      .getPathToProjectById(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    let boardMembership = await sails.helpers.users.getBoardMembershipForCurrentUser(
      currentUser.id,
      board.id,
    );

    if (!boardMembership) {
      boardMembership = await sails.helpers.users.createBoardMembershipForCurrentUser(
        board.id,
        currentUser,
      );
    }

    const boardVersions = await BoardVersion.find({
      boardId: inputs.boardId,
    })
      .sort('createdAt DESC')
      .limit(inputs.limit)
      .skip(inputs.offset);

    const total = await BoardVersion.count({
      boardId: inputs.boardId,
    });

    return exits.success({
      items: boardVersions,
      total,
    });
  },
};
