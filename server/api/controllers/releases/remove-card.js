/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /api/releases/{releaseId}/cards/{cardId}:
 *   delete:
 *     summary: Remove a card from a release
 *     tags:
 *       - Releases
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: releaseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Release ID
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID to remove from the release
 *     responses:
 *       200:
 *         description: Card removed from release successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/ReleaseCard'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Release card association not found
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  RELEASE_CARD_NOT_FOUND: {
    releaseCardNotFound: 'Release card association not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    releaseId: {
      ...idInput,
      required: true,
    },
    cardId: {
      ...idInput,
      required: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const releaseCard = await ReleaseCard.findOne({
      releaseId: inputs.releaseId,
      cardId: inputs.cardId,
    });

    if (!releaseCard) {
      throw Errors.RELEASE_CARD_NOT_FOUND;
    }

    const release = await BoardRelease.findOne(inputs.releaseId);

    const boardMembership = await BoardMembership.findOne({
      boardId: release.boardId,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    await ReleaseCard.destroyOne({ id: releaseCard.id });

    const boardRelatedUserIds = await sails.helpers.boards.getMemberUserIds(release.boardId);

    boardRelatedUserIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'releaseCardDelete',
        {
          item: releaseCard,
        },
        this.req,
      );
    });

    return {
      item: releaseCard,
    };
  },
};
