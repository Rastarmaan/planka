/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /board-teams/{id}:
 *   patch:
 *     summary: Update board team
 *     description: Updates a board team role. Requires project manager permissions.
 *     tags:
 *       - Board Teams
 *     operationId: updateBoardTeam
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the board team
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [editor, viewer]
 *                 description: Role of the team in the board
 *                 example: editor
 *               canComment:
 *                 type: boolean
 *                 nullable: true
 *                 description: Whether the team can comment on cards (applies only to viewers)
 *                 example: true
 *     responses:
 *       200:
 *         description: Board team updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/BoardTeam'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Roles = {
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

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
    role: {
      type: 'string',
      isIn: Object.values(Roles),
    },
    canComment: {
      type: 'boolean',
      allowNull: true,
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

    const values = _.pick(inputs, ['role', 'canComment']);

    const updatedBoardTeam = await sails.helpers.boardTeams.updateOne.with({
      record: boardTeam,
      values,
      board,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: updatedBoardTeam,
    };
  },
};
