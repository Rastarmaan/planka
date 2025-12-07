/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/{cardId}/release:
 *   patch:
 *     summary: Update card release
 *     description: Updates the release assignment for a card.
 *     tags:
 *       - Cards
 *     operationId: updateCardRelease
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the card
 *         example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               releaseId:
 *                 type: string
 *                 nullable: true
 *                 description: ID of the release to assign the card to, or null to unassign
 *                 example: "1357158568008091265"
 *     responses:
 *       200:
 *         description: Card release updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Card'
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
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    releaseId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { cardId } = inputs;

    const card = await Card.findOne(cardId).populate('board', {
      select: ['id', 'projectId'],
    });

    if (!card) {
      throw 'notFound';
    }

    const project = await Project.findOne(card.board.projectId).populate('managerUsers');

    if (!project) {
      throw 'notFound';
    }

    const isProjectManager = project.managerUsers.some(
      (managerUser) => managerUser.id === currentUser.id,
    );

    // Check if user has permission to edit the card
    const boardMembership = await BoardMembership.findOne({
      boardId: card.boardId,
      userId: currentUser.id,
    });

    const canEdit =
      isProjectManager ||
      User.isAdminLevel(currentUser) ||
      (boardMembership && boardMembership.role === BoardMembership.Roles.EDITOR);

    if (!canEdit) {
      throw 'forbidden';
    }

    // If releaseId is provided, validate it belongs to the same project
    if (inputs.releaseId) {
      const release = await ProjectRelease.findOne({
        id: inputs.releaseId,
        projectId: card.board.projectId,
      });

      if (!release) {
        throw {
          name: 'badRequest',
          message: 'Release not found or does not belong to the same project',
        };
      }

      // Only allow assigning to unreleased releases
      if (release.status === ProjectRelease.Statuses.RELEASED) {
        throw {
          name: 'badRequest',
          message: 'Cannot assign cards to released releases',
        };
      }
    }

    const updatedCard = await Card.updateOne({ id: cardId }).set({
      releaseId: inputs.releaseId,
    });

    return exits.success({
      item: updatedCard,
    });
  },
};
