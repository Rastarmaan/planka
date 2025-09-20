/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/versions/{versionId}:
 *   delete:
 *     summary: Delete board version
 *     description: Deletes a specific board version. Requires board member permissions.
 *     tags:
 *       - Board Versions
 *     operationId: deleteBoardVersion
 *     parameters:
 *       - name: boardId
 *         in: path
 *         required: true
 *         description: ID of the board
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: versionId
 *         in: path
 *         required: true
 *         description: ID of the version to delete
 *         schema:
 *           type: string
 *           example: "1357158568008091265"
 *     responses:
 *       200:
 *         description: Version deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Board or version not found
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  VERSION_NOT_FOUND: {
    versionNotFound: 'Version not found',
  },
};

module.exports = {
  inputs: {
    boardId: {
      ...idInput,
      required: true,
    },
    versionId: {
      ...idInput,
      required: true,
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
    versionNotFound: {
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

    const boardVersion = await BoardVersion.findOne({
      id: inputs.versionId,
      boardId: inputs.boardId,
    });

    if (!boardVersion) {
      throw Errors.VERSION_NOT_FOUND;
    }

    await BoardVersion.destroyOne({ id: inputs.versionId });

    sails.sockets.broadcast(
      `board:${board.id}`,
      'boardVersionDelete',
      {
        item: boardVersion,
      },
      this.req,
    );

    return exits.success({
      success: true,
    });
  },
};
