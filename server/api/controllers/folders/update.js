/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /folders/{id}:
 *   patch:
 *     summary: Update folder
 *     description: Update folder name or move to different parent
 *     tags:
 *       - Folders
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
    parentFolderId: {
      type: 'string',
      allowNull: true,
      regex: /^\d+$/,
    },
  },

  async fn(inputs) {
    const folder = await DocumentFolder.findOne({ id: inputs.id, isDeleted: false });

    if (!folder) {
      throw 'notFound';
    }

    const { currentUser } = this.req;
    const isAdmin = currentUser.role === 'admin';

    if (!isAdmin) {
      const hasPermission = await sails.helpers.permissions.checkPermission.with({
        userId: currentUser.id,
        resourceType: 'folder',
        resourceId: inputs.id,
        permissionType: 'canEdit',
      });

      if (!hasPermission) {
        throw 'notFound';
      }
    }

    if (inputs.parentFolderId !== undefined) {
      if (inputs.parentFolderId) {
        const newParent = await DocumentFolder.findOne({
          id: inputs.parentFolderId,
          spaceId: folder.spaceId,
          isDeleted: false,
        });

        if (!newParent) {
          throw 'notFound';
        }

        if (newParent.path.includes(`/${folder.id}/`) || newParent.path.endsWith(`/${folder.id}`)) {
          throw {
            message: 'Cannot move folder into its own descendant',
            code: 'E_CIRCULAR_REFERENCE',
          };
        }
      }
    }

    const updatedFolder = await sails.helpers.folders.updateOne.with({
      record: folder,
      values: _.pick(inputs, ['name', 'parentFolderId']),
      user: this.req.currentUser,
      request: this.req,
    });

    return {
      item: updatedFolder,
    };
  },
};
