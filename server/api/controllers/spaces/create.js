/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /spaces:
 *   post:
 *     summary: Create a new space
 *     description: Creates a new document management space (admin only)
 *     tags:
 *       - Spaces
 *     operationId: createSpace
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Marketing Documents
 *               description:
 *                 type: string
 *                 example: All marketing materials and documents
 *               color:
 *                 type: string
 *                 example: "#3498db"
 *     responses:
 *       200:
 *         description: Space created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Space'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */

module.exports = {
  inputs: {
    name: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 255,
    },
    description: {
      type: 'string',
      allowNull: true,
    },
    color: {
      type: 'string',
      allowNull: true,
      regex: /^#[0-9A-Fa-f]{6}$/,
    },
  },

  async fn(inputs) {
    const space = await sails.helpers.spaces.createOne.with({
      name: inputs.name,
      description: inputs.description,
      color: inputs.color,
      user: this.req.currentUser,
      request: this.req,
    });

    return {
      item: space,
    };
  },
};
