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
    const isAdmin = User.isAdminLevel(currentUser);

    const space = await Space.findOne({
      id: inputs.id,
      isDeleted: false,
    });

    if (!space) {
      throw 'notFound';
    }

    if (!isAdmin) {
      const spacePermission = await DocumentPermission.findOne({
        user: currentUser.id,
        resourceType: 'space',
        resourceId: inputs.id,
      });

      if (!spacePermission) {
        const folderPermissions = await DocumentPermission.find({
          user: currentUser.id,
          resourceType: 'folder',
        });

        const folderIds = folderPermissions.map((perm) => perm.resourceId);
        const folders = await DocumentFolder.find({
          id: folderIds,
          isDeleted: false,
        });

        let hasAccess = folders.some((folder) => String(folder.space) === String(inputs.id));

        if (!hasAccess) {
          const filePermissions = await DocumentPermission.find({
            user: currentUser.id,
            resourceType: 'file',
          });

          const fileIds = filePermissions.map((perm) => perm.resourceId);
          const files = await DocumentFile.find({
            id: fileIds,
            isDeleted: false,
          });

          hasAccess = files.some((file) => String(file.space) === String(inputs.id));
        }

        if (!hasAccess) {
          throw 'notFound';
        }
      }
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
