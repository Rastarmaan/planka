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
    const folder = await DocumentFolder.findOne({ id: inputs.id, isDeleted: false });

    if (!folder) {
      throw 'notFound';
    }

    const space = await Space.findOne({
      id: folder.space,
      createdByUser: this.req.currentUser.id,
    });
    if (!space) {
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
