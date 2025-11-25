/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /spaces/{spaceId}/folders:
 *   post:
 *     summary: Create a new folder
 *     description: Creates a new folder in a space
 *     tags:
 *       - Folders
 */

module.exports = {
  inputs: {
    spaceId: {
      type: 'string',
      required: false,
      regex: /^\d+$/,
    },
    folderId: {
      type: 'string',
      required: false,
      regex: /^\d+$/,
    },
    name: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 255,
    },
    parentFolderId: {
      type: 'string',
      allowNull: true,
      regex: /^\d+$/,
    },
    description: {
      type: 'string',
      allowNull: true,
      maxLength: 1000,
    },
  },

  async fn(inputs) {
    let { spaceId } = inputs;
    let parentFolderId = inputs.parentFolderId || inputs.folderId;

    if (inputs.folderId) {
      const parentFolder = await DocumentFolder.findOne({
        id: inputs.folderId,
        isDeleted: false,
      });

      if (!parentFolder) {
        throw 'notFound';
      }

      spaceId = parentFolder.space;
      parentFolderId = inputs.folderId;
    }

    const space = await Space.findOne({
      id: spaceId,
      isDeleted: false,
      createdByUser: this.req.currentUser.id,
    });

    if (!space) {
      throw 'notFound';
    }

    if (inputs.parentFolderId && !inputs.folderId) {
      const parentFolder = await DocumentFolder.findOne({
        id: inputs.parentFolderId,
        space: spaceId,
        isDeleted: false,
      });

      if (!parentFolder) {
        throw 'notFound';
      }
    }

    const folder = await sails.helpers.folders.createOne.with({
      spaceId,
      name: inputs.name,
      description: inputs.description,
      parentFolderId,
      user: this.req.currentUser,
      request: this.req,
    });

    return {
      item: folder,
    };
  },
};
