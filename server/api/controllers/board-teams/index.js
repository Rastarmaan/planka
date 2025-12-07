/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/board-teams:
 *   get:
 *     summary: Get board teams
 *     description: Returns all teams associated with a board.
 *     tags:
 *       - Board Teams
 *     operationId: getBoardTeams
 *     parameters:
 *       - name: boardId
 *         in: path
 *         required: true
 *         description: ID of the board
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Board teams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - items
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BoardTeam'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board } = await sails.helpers.boards
      .getPathToProjectById(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    if (currentUser.role !== User.Roles.ADMIN) {
      const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
        board.id,
        currentUser.id,
      );

      if (!boardMembership) {
        throw Errors.BOARD_NOT_FOUND;
      }
    }

    const boardTeams = await BoardTeam.qm.getByBoardId(board.id);

    return {
      items: boardTeams,
    };
  },
};
