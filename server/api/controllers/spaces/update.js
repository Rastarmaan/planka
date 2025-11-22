/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /spaces/{id}:
 *   patch:
 *     summary: Update space
 *     description: Updates a space's properties
 *     tags:
 *       - Spaces
 *     operationId: updateSpace
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Space ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Space updated successfully
 *       404:
 *         description: Space not found
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
      regex: /^\d+$/,
    },
    name: {
      type: 'string',
      allowNull: true,
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
    const space = await Space.findOne({ id: inputs.id, isDeleted: false });

    if (!space) {
      throw 'notFound';
    }

    const updatedSpace = await sails.helpers.spaces.updateOne.with({
      record: space,
      values: _.pick(inputs, ['name', 'description', 'color']),
      user: this.req.currentUser,
      request: this.req,
    });

    return {
      item: updatedSpace,
    };
  },
};
