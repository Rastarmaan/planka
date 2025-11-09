/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /board-links/{id}:
 *   patch:
 *     summary: Update board link
 *     description: Update sync settings for a board link
 *     tags:
 *       - Board Links
 *     operationId: updateBoardLink
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Board link ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               syncEnabled:
 *                 type: boolean
 *                 description: Enable or disable synchronization
 *               syncDirection:
 *                 type: string
 *                 enum: [bidirectional, one-way, none]
 *                 description: Sync direction
 *     responses:
 *       200:
 *         description: Board link updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   type: object
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_LINK_NOT_FOUND: { boardLinkNotFound: 'Board link not found' },
  NOT_ENOUGH_RIGHTS: { notEnoughRights: 'Not enough rights' },
};

module.exports = {
  inputs: {
    id: { ...idInput, required: true },
    syncEnabled: { type: 'boolean' },
    syncDirection: { type: 'string', isIn: ['bidirectional', 'one-way', 'none'] },
  },

  exits: {
    boardLinkNotFound: { responseType: 'notFound' },
    notEnoughRights: { responseType: 'forbidden' },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const boardLink = await BoardLink.findOne({ id: inputs.id });

    if (!boardLink) {
      throw Errors.BOARD_LINK_NOT_FOUND;
    }

    const sourceBoardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      boardLink.sourceBoardId,
      currentUser.id,
    );

    const targetBoardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      boardLink.linkedBoardId,
      currentUser.id,
    );

    if (!sourceBoardMembership && !targetBoardMembership) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const updateData = {};
    if (inputs.syncEnabled !== undefined) {
      updateData.syncEnabled = inputs.syncEnabled;
    }
    if (inputs.syncDirection !== undefined) {
      updateData.syncDirection = inputs.syncDirection;
    }

    const updatedLink = await BoardLink.updateOne({ id: inputs.id }).set(updateData);

    return {
      item: updatedLink,
    };
  },
};
