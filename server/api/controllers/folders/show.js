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
    const isAdmin = currentUser.role === 'admin';

    const folder = await DocumentFolder.findOne({ id: inputs.id, isDeleted: false });

    if (!folder) {
      throw 'notFound';
    }

    let hasAccess = false;

    if (isAdmin) {
      // Admins have access to all folders
      hasAccess = true;
    } else {
      const permissions = await DocumentPermission.find({
        user: currentUser.id,
        or: [
          { resourceType: 'folder', resourceId: folder.id },
          { resourceType: 'space', resourceId: folder.space },
        ],
      }).limit(1);
      hasAccess = permissions.length > 0;
    }

    if (!hasAccess) {
      throw 'forbidden';
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
