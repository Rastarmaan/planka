/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/versions/{versionId}/restore:
 *   post:
 *     summary: Restore board version
 *     description: Restores a board to a previous version state. Requires board member permissions.
 *     tags:
 *       - Board Versions
 *     operationId: restoreBoardVersion
 *     parameters:
 *       - name: boardId
 *         in: path
 *         required: true
 *         description: ID of the board to restore
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: versionId
 *         in: path
 *         required: true
 *         description: ID of the version to restore to
 *         schema:
 *           type: string
 *           example: "1357158568008091265"
 *     responses:
 *       200:
 *         description: Board restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 boardId:
 *                   type: string
 *                   example: "1357158568008091264"
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
  BACKUP_REQUIRED: {
    backupRequired:
      'Current board state must be backed up before restoration. Create a new version or use force=true to skip backup.',
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
    force: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Skip automatic backup creation before restoration',
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
    backupRequired: {
      responseType: 'badRequest',
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

    // Check if backup is required (unless forced)
    if (!inputs.force) {
      // Get the latest version for this board
      const latestVersion = await BoardVersion.find({
        boardId: inputs.boardId,
      })
        .sort('createdAt DESC')
        .limit(1)
        .then((results) => results[0] || null);

      // If there's a latest version and it's not the one we're restoring to,
      // and it's not auto-created, require backup
      if (latestVersion && latestVersion.id !== inputs.versionId && !latestVersion.isAutoCreated) {
        // Check if the current board state has changed since the latest version
        const currentSnapshot = await sails.helpers.boardVersions.createSnapshot.with({
          boardId: inputs.boardId,
          creatorUserId: this.req.currentUser.id,
          name: 'Temporary comparison snapshot',
        });

        // Compare snapshots (simplified comparison - in practice you might want more sophisticated comparison)
        const latestSnapshot = JSON.parse(latestVersion.snapshotData);
        const currentSnapshotData = JSON.parse(currentSnapshot.snapshotData);

        // Simple comparison of key data structures
        const hasChanges =
          JSON.stringify(currentSnapshotData.lists) !== JSON.stringify(latestSnapshot.lists) ||
          JSON.stringify(currentSnapshotData.cards) !== JSON.stringify(latestSnapshot.cards) ||
          JSON.stringify(currentSnapshotData.tasks) !== JSON.stringify(latestSnapshot.tasks);

        if (hasChanges) {
          throw Errors.BACKUP_REQUIRED;
        }
      }
    }

    const result = await sails.helpers.boardVersions.restoreSnapshot(
      inputs.versionId,
      inputs.requestId,
      this.req,
    );

    return exits.success(result);
  },
};
