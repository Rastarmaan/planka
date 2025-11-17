/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /api/releases/{releaseId}/cards:
 *   post:
 *     summary: Add a card to a release
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardId
 *             properties:
 *               cardId:
 *                 type: string
 *                 description: Card ID to add to the release
 *                 example: "1357158568008091266"
 *     responses:
 *       200:
 *         description: Card added to release successfully
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
 *         description: Release or card not found
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  RELEASE_NOT_FOUND: {
    releaseNotFound: 'Release not found',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_ALREADY_IN_RELEASE: {
    cardAlreadyInRelease: 'Card is already in this release',
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

    const release = await BoardRelease.findOne(inputs.releaseId);

    if (!release) {
      throw Errors.RELEASE_NOT_FOUND;
    }

    const card = await Card.findOne(inputs.cardId);

    if (!card) {
      throw Errors.CARD_NOT_FOUND;
    }

    const boardMembership = await BoardMembership.findOne({
      boardId: card.boardId,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (release.boardId !== card.boardId) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const existingReleaseCard = await ReleaseCard.findOne({
      releaseId: inputs.releaseId,
      cardId: inputs.cardId,
    });

    if (existingReleaseCard) {
      throw Errors.CARD_ALREADY_IN_RELEASE;
    }

    const releaseCard = await ReleaseCard.create({
      releaseId: inputs.releaseId,
      cardId: inputs.cardId,
    }).fetch();

    const boardRelatedUserIds = await sails.helpers.boards.getMemberUserIds(card.boardId);

    boardRelatedUserIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'releaseCardCreate',
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
