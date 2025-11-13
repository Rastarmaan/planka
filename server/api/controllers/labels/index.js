/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /labels:
 *   get:
 *     summary: Get all labels
 *     description: Retrieves all labels from all boards across all projects that the user has access to.
 *     tags:
 *       - Labels
 *     operationId: getAllLabels
 *     responses:
 *       200:
 *         description: All labels retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - items
 *               properties:
 *                 items:
 *                   type: array
 *                   description: List of all labels
 *                   items:
 *                     $ref: '#/components/schemas/Label'
 *       403:
 *         description: Not enough rights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

module.exports = {
  inputs: {},

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn() {
    const { currentUser } = this.req;

    if (!currentUser) {
      throw 'notEnoughRights';
    }

    let accessibleBoardIds = [];

    if (currentUser.isAdmin) {
      const allBoards = await Board.find();
      accessibleBoardIds = allBoards.map((board) => board.id);
    } else {
      const projectManagerships = await ProjectManager.find({
        userId: currentUser.id,
      });
      const managedProjectIds = projectManagerships.map((pm) => pm.projectId);

      const managedBoards = await Board.find({
        projectId: managedProjectIds,
      });

      const boardMemberships = await BoardMembership.find({
        userId: currentUser.id,
      });
      const memberBoardIds = boardMemberships.map((bm) => bm.boardId);

      accessibleBoardIds = [...managedBoards.map((board) => board.id), ...memberBoardIds];
      accessibleBoardIds = [...new Set(accessibleBoardIds)];
    }

    const labels = await Label.find({
      boardId: accessibleBoardIds,
    }).sort('position ASC');

    return {
      items: labels,
    };
  },
};
