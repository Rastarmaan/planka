/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /spaces/{spaceId}/folders:
 *   get:
 *     summary: List folders in a space
 *     description: Get all folders in a specific space
 *     tags:
 *       - Folders
 *     parameters:
 *       - name: spaceId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: parentFolderId
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Folders retrieved successfully
 */

module.exports = {
  inputs: {
    spaceId: {
      type: 'string',
      required: true,
      regex: /^\d+$/,
    },
    parentFolderId: {
      type: 'string',
      allowNull: true,
      regex: /^\d+$/,
    },
    includeDeleted: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  async fn(inputs) {
    const space = await Space.findOne({ id: inputs.spaceId, isDeleted: false });

    if (!space) {
      throw 'notFound';
    }

    const criteria = {
      space: inputs.spaceId,
    };

    if (!inputs.includeDeleted) {
      criteria.isDeleted = false;
    }

    if (inputs.parentFolderId) {
      criteria.parentFolder = inputs.parentFolderId;
    } else {
      criteria.parentFolder = null;
    }

    const folders = await DocumentFolder.find(criteria).sort('name ASC');

    // Also fetch root-level files if no parentFolderId specified
    let files = [];
    if (!inputs.parentFolderId) {
      files = await DocumentFile.find({
        space: inputs.spaceId,
        folder: null,
        isDeleted: false,
      }).sort('name ASC');
    }

    return {
      items: folders,
      included: {
        files,
      },
    };
  },
};
