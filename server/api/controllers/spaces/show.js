/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /spaces/{id}:
 *   get:
 *     summary: Get space by ID
 *     description: Retrieves a specific space with its contents
 *     tags:
 *       - Spaces
 *     operationId: getSpace
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Space ID
 *     responses:
 *       200:
 *         description: Space retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Space'
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
    const isAdmin = currentUser.role === 'admin';

    let space;
    if (isAdmin) {
      space = await Space.findOne({
        id: inputs.id,
        isDeleted: false,
      });
    } else {
      space = await Space.findOne({
        id: inputs.id,
        isDeleted: false,
      });

      if (space) {
        const permissions = await DocumentPermission.find({
          user: currentUser.id,
          resourceType: 'space',
          resourceId: inputs.id,
        }).limit(1);

        if (permissions.length === 0) {
          space = null;
        }
      }
    }

    if (!space) {
      throw 'notFound';
    }

    if (this.req.isSocket) {
      sails.sockets.join(this.req, `space:${space.id}`);
      sails.sockets.join(this.req, 'admins');
    }

    return {
      item: space,
    };
  },
};
