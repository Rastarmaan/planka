/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/board-teams:
 *   post:
 *     summary: Add team to board
 *     description: Adds a team to a board. Requires project manager permissions.
 *     tags:
 *       - Board Teams
 *     operationId: createBoardTeam
 *     parameters:
 *       - name: boardId
 *         in: path
 *         required: true
 *         description: ID of the board
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: string
 *                 description: ID of the team to add
 *                 example: "1357158568008091265"
 *               role:
 *                 type: string
 *                 enum: [editor, viewer]
 *                 description: Role of the team in the board
 *                 example: viewer
 *               canComment:
 *                 type: boolean
 *                 nullable: true
 *                 description: Whether the team can comment on cards (applies only to viewers)
 *                 example: true
 *     responses:
 *       200:
 *         description: Team added to board successfully
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
 *       409:
 *         $ref: '#/components/responses/Conflict'
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
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  TEAM_NOT_FOUND: {
    teamNotFound: 'Team not found',
  },
  TEAM_ALREADY_IN_BOARD: {
    teamAlreadyInBoard: 'Team already in board',
  },
};

module.exports = {
  inputs: {
    boardId: {
      ...idInput,
      required: true,
    },
    teamId: {
      ...idInput,
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(Roles),
      defaultsTo: Roles.VIEWER,
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
    boardNotFound: {
      responseType: 'notFound',
    },
    teamNotFound: {
      responseType: 'notFound',
    },
    teamAlreadyInBoard: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers.boards
      .getPathToProjectById(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    // Check if user is project manager or admin
    if (!User.isAdminLevel(currentUser)) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.BOARD_NOT_FOUND; // Forbidden
      }
    }

    const team = await Team.qm.getOneById(inputs.teamId);

    if (!team) {
      throw Errors.TEAM_NOT_FOUND;
    }

    // Check if team is already in board
    const existingBoardTeam = await BoardTeam.qm.getOneByBoardIdAndTeamId(board.id, team.id);

    if (existingBoardTeam) {
      throw Errors.TEAM_ALREADY_IN_BOARD;
    }

    const { boardTeam, boardMemberships, users } = await sails.helpers.boardTeams.createOne.with({
      board,
      team,
      role: inputs.role,
      canComment: inputs.canComment,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: boardTeam,
      included: {
        boardMemberships,
        users,
      },
    };
  },
};
