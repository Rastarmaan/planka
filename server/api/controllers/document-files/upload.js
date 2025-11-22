/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /spaces/{spaceId}/upload:
 *   post:
 *     summary: Upload file to space
 *     description: Upload one or more files to a space
 *     tags:
 *       - Files
 */

module.exports = {
  inputs: {
    spaceId: {
      type: 'string',
      required: true,
      regex: /^\d+$/,
    },
    folderId: {
      type: 'string',
      allowNull: true,
      regex: /^\d+$/,
    },
  },

  async fn(inputs) {
    const space = await Space.findOne({ id: inputs.spaceId, isDeleted: false });

    if (!space) {
      throw 'notFound';
    }

    if (inputs.folderId) {
      const folder = await DocumentFolder.findOne({
        id: inputs.folderId,
        space: inputs.spaceId,
        isDeleted: false,
      });

      if (!folder) {
        throw 'notFound';
      }
    }

    const files = await sails.helpers.documentFiles.uploadFiles.with({
      spaceId: inputs.spaceId,
      folderId: inputs.folderId,
      user: this.req.currentUser,
      request: this.req,
    });

    return {
      items: files,
    };
  },
};
