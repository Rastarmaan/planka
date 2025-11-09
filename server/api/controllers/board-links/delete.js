/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /board-links/{id}:
 *   delete:
 *     summary: Delete board link
 *     description: Unlink boards (stops synchronization, but keeps both boards)
 *     tags:
 *       - Board Links
 *     operationId: deleteBoardLink
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Board link ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board link deleted successfully
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

    await SyncMapping.destroy({ boardLinkId: boardLink.id });

    await BoardLink.destroyOne({ id: inputs.id });

    return {
      item: { id: inputs.id },
    };
  },
};
