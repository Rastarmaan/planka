/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /spaces/{id}:
 *   delete:
 *     summary: Delete space
 *     description: Soft deletes a space and all its contents
 *     tags:
 *       - Spaces
 *     operationId: deleteSpace
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Space ID
 *     responses:
 *       200:
 *         description: Space deleted successfully
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
  },

  async fn(inputs) {
    const { currentUser } = this.req;
    const isAdmin = User.isAdminLevel(currentUser);

    if (!isAdmin) {
      throw 'forbidden';
    }

    const space = await Space.findOne({
      id: inputs.id,
      isDeleted: false,
    });

    if (!space) {
      throw 'notFound';
    }

    await sails.helpers.spaces.deleteOne.with({
      record: space,
      user: this.req.currentUser,
      request: this.req,
    });

    return {
      item: space,
    };
  },
};
