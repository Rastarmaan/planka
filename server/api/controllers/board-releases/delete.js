/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/releases/{id}:
 *   delete:
 *     summary: Delete a release
 *     description: Deletes an existing release. Only non-released releases can be deleted.
 *     tags:
 *       - Board Releases
 *     operationId: deleteBoardRelease
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
 *         description: Release deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/BoardRelease'
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

    const canEdit =
      isProjectManager ||
      User.isAdminLevel(currentUser) ||
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
      throw new Error('Cannot delete released releases');
    }

    const releaseCardsCount = await ReleaseCard.count({ releaseId: release.id });
    if (releaseCardsCount > 0) {
      throw new Error('Cannot delete release that has cards assigned to it');
    }

    await BoardRelease.destroyOne({
      id: inputs.id,
      boardId: inputs.boardId,
    });

    sails.sockets.broadcast(
      `board:${inputs.boardId}`,
      'boardReleaseDelete',
      {
        item: release,
      },
      this.req,
    );

    return exits.success({
      item: release,
    });
  },
};
