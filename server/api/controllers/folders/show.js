/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /folders/{id}:
 *   get:
 *     summary: Get folder details
 *     description: Get a specific folder with its contents
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
    const { currentUser } = this.req;
    const isAdmin = User.isAdminLevel(currentUser);

    const folder = await DocumentFolder.findOne({ id: inputs.id, isDeleted: false });

    if (!folder) {
      throw 'notFound';
    }

    let hasAccess = false;

    if (isAdmin) {
      hasAccess = true;
    } else {
      hasAccess = await sails.helpers.permissions.checkPermission.with({
        userId: currentUser.id,
        resourceType: 'folder',
        resourceId: inputs.id,
        permissionType: 'canView',
      });
    }

    if (!hasAccess) {
      throw 'notFound';
    }

    if (this.req.isSocket) {
      sails.sockets.join(this.req, `space:${folder.space}`);
    }

    const childFolders = await DocumentFolder.find({
      parentFolder: folder.id,
      isDeleted: false,
    }).sort('name ASC');

    const files = await DocumentFile.find({
      folder: folder.id,
      isDeleted: false,
    }).sort('name ASC');

    return {
      item: folder,
      included: {
        folders: childFolders,
        files,
      },
    };
  },
};
