/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /board-teams/{id}:
 *   delete:
 *     summary: Remove team from board
 *     description: Removes a team from a board. Requires project manager permissions.
 *     tags:
 *       - Board Teams
 *     operationId: deleteBoardTeam
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the board team
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Team removed from board successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/BoardTeam'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  BOARD_TEAM_NOT_FOUND: {
    boardTeamNotFound: 'Board team not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    boardTeamNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const boardTeam = await BoardTeam.findOne({ id: inputs.id });

    if (!boardTeam) {
      throw Errors.BOARD_TEAM_NOT_FOUND;
    }

    const { board, project } = await sails.helpers.boards
      .getPathToProjectById(boardTeam.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_TEAM_NOT_FOUND);

    // Check if user is project manager or admin
    if (currentUser.role !== User.Roles.ADMIN) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const deletedBoardTeam = await sails.helpers.boardTeams.deleteOne.with({
      record: boardTeam,
      board,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: deletedBoardTeam,
    };
  },
};
