/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /files/{id}:
 *   patch:
 *     summary: Update file
 *     description: Update file metadata or upload new version
 *     tags:
 *       - Files
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
    folderId: {
      type: 'string',
      allowNull: true,
      regex: /^\d+$/,
    },
  },

  async fn(inputs) {
    const file = await DocumentFile.findOne({ id: inputs.id, isDeleted: false });

    if (!file) {
      throw 'notFound';
    }

    if (inputs.folderId !== undefined && inputs.folderId) {
      const folder = await DocumentFolder.findOne({
        id: inputs.folderId,
        spaceId: file.spaceId,
        isDeleted: false,
      });

      if (!folder) {
        throw 'notFound';
      }
    }

    const updatedFile = await sails.helpers.documentFiles.updateOne.with({
      record: file,
      values: _.pick(inputs, ['name', 'folderId']),
      user: this.req.currentUser,
      request: this.req,
    });

    return {
      item: updatedFile,
    };
  },
};
