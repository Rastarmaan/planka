/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /folders/{id}:
 *   delete:
 *     summary: Delete folder
 *     description: Soft delete a folder and all its contents
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
  },

  async fn(inputs) {
    const folder = await DocumentFolder.findOne({ id: inputs.id, isDeleted: false });

    if (!folder) {
      throw 'notFound';
    }

    const { currentUser } = this.req;
    const isAdmin = User.isAdminLevel(currentUser);

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

    await sails.helpers.folders.deleteOne.with({
      record: folder,
      user: this.req.currentUser,
      request: this.req,
    });

    return {
      item: folder,
    };
  },
};
