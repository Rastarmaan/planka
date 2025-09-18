/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{id}/transfer:
 *   patch:
 *     summary: Transfer board to another project
 *     description: Transfers a board from one project to another. Requires admin or project manager permissions for both source and target projects.
 *     tags:
 *       - Boards
 *     operationId: transferBoard
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the board to transfer
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
 *               - projectId
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: ID of the target project
 *                 example: "1357158568008091265"
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 description: Position in the target project (optional)
 *                 example: 65536
 *     responses:
 *       200:
 *         description: Board transferred successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *                 - included
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Board'
 *                 included:
 *                   type: object
 *                   properties:
 *                     boardMemberships:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BoardMembership'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: E_FORBIDDEN
 *                 message:
 *                   type: string
 *                   example: Insufficient permissions to transfer board
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  TARGET_PROJECT_NOT_FOUND: {
    targetProjectNotFound: 'Target project not found',
  },
  INSUFFICIENT_PERMISSIONS: {
    insufficientPermissions: 'Insufficient permissions to transfer board',
  },
  SAME_PROJECT: {
    sameProject: 'Board is already in the target project',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    projectId: {
      ...idInput,
      required: true,
    },
    position: {
      type: 'number',
      min: 0,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
    targetProjectNotFound: {
      responseType: 'notFound',
    },
    insufficientPermissions: {
      responseType: 'forbidden',
    },
    sameProject: {
      responseType: 'badRequest',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    let board;
    try {
      board = await sails.helpers.boards.getPathToProjectById(inputs.id);
    } catch (error) {
      return exits.boardNotFound(Errors.BOARD_NOT_FOUND);
    }

    const isSourceProjectManager = await sails.helpers.users.isProjectManager(
      currentUser.id,
      inputs.projectId,
    );

    if (!isSourceProjectManager && !currentUser.isAdmin) {
      return exits.insufficientPermissions(Errors.INSUFFICIENT_PERMISSIONS);
    }

    let targetProject;
    try {
      targetProject = await Project.findOne(inputs.projectId);
      if (!targetProject) {
        return exits.targetProjectNotFound(Errors.TARGET_PROJECT_NOT_FOUND);
      }
    } catch (error) {
      return exits.targetProjectNotFound(Errors.TARGET_PROJECT_NOT_FOUND);
    }

    const isTargetProjectManager = await sails.helpers.users.isProjectManager(
      currentUser.id,
      inputs.projectId,
    );

    if (!isTargetProjectManager && !currentUser.isAdmin) {
      return exits.insufficientPermissions(Errors.INSUFFICIENT_PERMISSIONS);
    }

    if (board.projectId === inputs.projectId) {
      return exits.sameProject(Errors.SAME_PROJECT);
    }

    const transferredBoard = await sails.helpers.boards.transferOne(
      inputs.id,
      inputs.projectId,
      inputs.position,
      this.req,
    );

    return exits.success({
      item: transferredBoard,
      included: {
        boardMemberships: transferredBoard.boardMemberships,
      },
    });
  },
};
