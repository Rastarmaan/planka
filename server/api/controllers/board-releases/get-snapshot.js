/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/releases/{id}/snapshot:
 *   get:
 *     summary: Get release snapshot
 *     description: Retrieves the board snapshot for a released release, showing the state of cards at the time of release.
 *     tags:
 *       - Board Releases
 *     operationId: getBoardReleaseSnapshot
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
 *     responses:
 *       200:
 *         description: Release snapshot retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   type: object
 *                   properties:
 *                     release:
 *                       $ref: '#/components/schemas/BoardRelease'
 *                     boardVersion:
 *                       $ref: '#/components/schemas/BoardVersion'
 *                     snapshot:
 *                       type: object
 *                       description: The snapshot data containing board state
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
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

    const canView =
      isProjectManager || User.isAdminLevel(currentUser) || boardMembership !== undefined;

    if (!canView) {
      throw 'forbidden';
    }

    const release = await BoardRelease.findOne({
      id: inputs.id,
      boardId: inputs.boardId,
    });

    if (!release) {
      throw 'notFound';
    }

    if (!release.boardVersionId) {
      throw new Error('No snapshot available for this release');
    }

    const boardVersion = await BoardVersion.findOne({
      id: release.boardVersionId,
    });

    if (!boardVersion) {
      throw new Error('Snapshot not found');
    }

    let snapshotData;
    try {
      snapshotData =
        typeof boardVersion.snapshotData === 'string'
          ? JSON.parse(boardVersion.snapshotData)
          : boardVersion.snapshotData;
    } catch (error) {
      throw new Error('Failed to parse snapshot data');
    }

    return exits.success({
      item: {
        release,
        boardVersion: {
          id: boardVersion.id,
          name: boardVersion.name,
          description: boardVersion.description,
          metadata: boardVersion.metadata,
          createdAt: boardVersion.createdAt,
        },
        snapshot: snapshotData,
      },
    });
  },
};
