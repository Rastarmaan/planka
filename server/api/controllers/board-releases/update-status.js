/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/releases/{id}/status:
 *   patch:
 *     summary: Update release status
 *     description: Updates the status of a release (e.g., planning to in_progress to released).
 *     tags:
 *       - Board Releases
 *     operationId: updateBoardReleaseStatus
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [planning, in_progress, testing, completed, released, cancelled]
 *                 description: New status for the release
 *                 example: "released"
 *     responses:
 *       200:
 *         description: Release status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/BoardRelease'
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
    status: {
      type: 'string',
      isIn: Object.values(BoardRelease.Statuses),
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

    const canEdit =
      isProjectManager ||
      currentUser.role === User.Roles.ADMIN ||
      (boardMembership && boardMembership.role === BoardMembership.Roles.EDITOR);

    if (!canEdit) {
      throw 'forbidden';
    }

    const release = await BoardRelease.findOne({
      id: inputs.id,
      boardId: inputs.boardId,
    });

    if (!release) {
      throw 'notFound';
    }

    if (release.status === BoardRelease.Statuses.RELEASED) {
      throw new Error('Cannot change status of released releases');
    }

    const values = { status: inputs.status };

    if (inputs.status === BoardRelease.Statuses.RELEASED) {
      values.releasedAt = new Date();

      try {
        const boardVersion = await sails.helpers.boardVersions.createReleaseSnapshot(
          inputs.boardId,
          inputs.id,
          currentUser.id,
          release.name,
          release.version,
        );

        values.boardVersionId = boardVersion.id;
      } catch (error) {
        sails.log.error('Failed to create release snapshot:', error);
      }
    }

    const updatedRelease = await BoardRelease.updateOne({
      id: inputs.id,
      boardId: inputs.boardId,
    }).set(values);

    sails.sockets.broadcast(
      `board:${inputs.boardId}`,
      'boardReleaseUpdate',
      {
        item: updatedRelease,
      },
      this.req,
    );

    return exits.success({
      item: updatedRelease,
    });
  },
};
