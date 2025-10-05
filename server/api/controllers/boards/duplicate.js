/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/duplicate:
 *   post:
 *     summary: Duplicate board
 *     description: Duplicates a board, either as a new board or into an existing project without losing data.
 *     tags:
 *       - Boards
 *     operationId: duplicateBoard
 *     parameters:
 *       - name: boardId
 *         in: path
 *         required: true
 *         description: ID of the source board
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mode
 *             properties:
 *               mode:
 *                 type: string
 *                 enum: [new, existing]
 *                 description: Duplicate as new board or into an existing project
 *               targetProjectId:
 *                 type: string
 *                 nullable: true
 *                 description: Target project ID (required when mode=existing)
 *               name:
 *                 type: string
 *                 nullable: true
 *                 description: Optional new board name (defaults to source name + " (Copy)")
 *               includeArchived:
 *                 type: boolean
 *                 default: false
 *                 description: Include archived lists/cards
 *               requestId:
 *                 type: string
 *                 nullable: true
 *                 description: Optional idempotency key
 *     responses:
 *       200:
 *         description: Board duplicated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Board'
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: { boardNotFound: 'Board not found' },
  PROJECT_NOT_FOUND: { projectNotFound: 'Project not found' },
  NOT_ENOUGH_RIGHTS: { notEnoughRights: 'Not enough rights' },
  INVALID_MODE: { invalidMode: 'Invalid duplication mode' },
};

module.exports = {
  inputs: {
    boardId: { ...idInput, required: true },
    mode: { type: 'string', isIn: ['new', 'existing'], required: true },
    targetProjectId: { type: 'string' },
    name: { type: 'string', maxLength: 255 },
    includeArchived: { type: 'boolean' },
    requestId: { type: 'string', isNotEmptyString: true, maxLength: 128 },
  },

  exits: {
    boardNotFound: { responseType: 'notFound' },
    projectNotFound: { responseType: 'notFound' },
    notEnoughRights: { responseType: 'forbidden' },
    invalidMode: { responseType: 'badRequest' },
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

    if (!boardMembership || boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (inputs.mode === 'existing') {
      const targetProject = await Project.findOne({ id: inputs.targetProjectId });
      if (!targetProject) throw Errors.PROJECT_NOT_FOUND;
    } else if (inputs.mode !== 'new') {
      throw Errors.INVALID_MODE;
    }

    const result = await sails.helpers.boards.duplicate.with({
      sourceBoardId: inputs.boardId,
      mode: inputs.mode,
      targetProjectId: inputs.targetProjectId,
      name: inputs.name,
      includeArchived: Boolean(inputs.includeArchived),
      userId: currentUser.id,
      requestId: inputs.requestId,
    });

    return { item: result.board };
  },
};
