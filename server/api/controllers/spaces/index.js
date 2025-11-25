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
    const { currentUser } = this.req;
    const isAdmin = currentUser.role === 'admin';

    let spaces = [];

    if (isAdmin) {
      const criteria = {
        createdByUser: currentUser.id,
      };

      if (!inputs.includeDeleted) {
        criteria.isDeleted = false;
      }

      spaces = await Space.find(criteria).sort('createdAt ASC');

      if (spaces.length === 0) {
        try {
          const existingSpaces = await Space.find(criteria);
          if (existingSpaces.length === 0) {
            const defaultSpace = await sails.helpers.spaces.createOne.with({
              name: 'Documents',
              description: 'Default document space',
              user: currentUser,
              request: this.req,
            });

            spaces = [defaultSpace];
          } else {
            spaces = existingSpaces.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          }
        } catch (error) {
          sails.log.error('Error creating default space:', error);
          spaces = await Space.find(criteria).sort('createdAt ASC');
        }
      }
    } else {
      const permissions = await DocumentPermission.find({
        user: currentUser.id,
      });

      if (permissions.length === 0) {
        return { items: [] };
      }

      const spaceIds = new Set();

      await Promise.all(
        permissions.map(async (perm) => {
          if (perm.resourceType === 'space') {
            spaceIds.add(perm.resourceId);
          } else if (perm.resourceType === 'folder') {
            const folder = await DocumentFolder.findOne({
              id: perm.resourceId,
              isDeleted: false,
            });
            if (folder && folder.space) {
              spaceIds.add(String(folder.space));
            }
          } else if (perm.resourceType === 'file') {
            const file = await DocumentFile.findOne({
              id: perm.resourceId,
              isDeleted: false,
            });
            if (file && file.space) {
              spaceIds.add(String(file.space));
            }
          }
        }),
      );

      if (spaceIds.size === 0) {
        return { items: [] };
      }

      const spaceCriteria = {
        id: Array.from(spaceIds),
      };

      if (!inputs.includeDeleted) {
        spaceCriteria.isDeleted = false;
      }

      spaces = await Space.find(spaceCriteria).sort('createdAt ASC');
    }

    return {
      items: spaces,
    };
  },
};
