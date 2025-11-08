/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/links:
 *   get:
 *     summary: Get board links
 *     description: Get all linked boards for a board
 *     tags:
 *       - Board Links
 *     operationId: getBoardLinks
 *     parameters:
 *       - name: boardId
 *         in: path
 *         required: true
 *         description: Board ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board links retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: { boardNotFound: 'Board not found' },
  NOT_ENOUGH_RIGHTS: { notEnoughRights: 'Not enough rights' },
};

module.exports = {
  inputs: {
    boardId: { ...idInput, required: true },
  },

  exits: {
    boardNotFound: { responseType: 'notFound' },
    notEnoughRights: { responseType: 'forbidden' },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board } = await sails.helpers.boards
      .getPathToProjectById(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const links = await sails.helpers.db.any(
      `
      SELECT
        bl.*,
        CASE
          WHEN bl.source_board_id = $1 THEN b_target.id
          ELSE b_source.id
        END as linked_board_id,
        CASE
          WHEN bl.source_board_id = $1 THEN b_target.name
          ELSE b_source.name
        END as linked_board_name,
        CASE
          WHEN bl.source_board_id = $1 THEN b_target.project_id
          ELSE b_source.project_id
        END as linked_project_id,
        CASE
          WHEN bl.source_board_id = $1 THEN p_target.name
          ELSE p_source.name
        END as linked_project_name
      FROM board_link bl
      LEFT JOIN board b_source ON bl.source_board_id = b_source.id
      LEFT JOIN board b_target ON bl.linked_board_id = b_target.id
      LEFT JOIN project p_source ON b_source.project_id = p_source.id
      LEFT JOIN project p_target ON b_target.project_id = p_target.id
      WHERE (bl.source_board_id = $1 OR bl.linked_board_id = $1)
      ORDER BY bl.created_at DESC
      `,
      [board.id],
    );

    return {
      items: links,
    };
  },
};
