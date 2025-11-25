/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /spaces:
 *   get:
 *     summary: Get all spaces
 *     description: Retrieves all document management spaces (admin only)
 *     tags:
 *       - Spaces
 *     operationId: getSpaces
 *     responses:
 *       200:
 *         description: Spaces retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Space'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */

module.exports = {
  inputs: {
    includeDeleted: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  async fn(inputs) {
    const criteria = {
      createdByUser: this.req.currentUser.id,
    };

    if (!inputs.includeDeleted) {
      criteria.isDeleted = false;
    }

    const spaces = await Space.find(criteria).sort('createdAt ASC');

    return {
      items: spaces,
    };
  },
};
