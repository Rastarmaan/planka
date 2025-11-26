/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /share-links:
 *   post:
 *     summary: Create a share link
 *     description: Create a public share link for a resource
 *     tags:
 *       - Share Links
 */

const crypto = require('crypto');
const bcrypt = require('bcrypt');

module.exports = {
  inputs: {
    resourceType: {
      type: 'string',
      required: true,
      isIn: Object.values(ShareLink.ResourceTypes),
    },
    resourceId: {
      type: 'string',
      required: true,
      regex: /^\d+$/,
    },
    isDownloadable: {
      type: 'boolean',
      defaultsTo: true,
    },
    password: {
      type: 'string',
      allowNull: true,
    },
    expiresAt: {
      type: 'string',
      allowNull: true,
    },
    maxAccessCount: {
      type: 'number',
      allowNull: true,
    },
  },

  async fn(inputs) {
    let resource;
    switch (inputs.resourceType) {
      case ShareLink.ResourceTypes.SPACE:
        resource = await Space.findOne({ id: inputs.resourceId, isDeleted: false });
        break;
      case ShareLink.ResourceTypes.FOLDER:
        resource = await DocumentFolder.findOne({ id: inputs.resourceId, isDeleted: false });
        break;
      case ShareLink.ResourceTypes.FILE:
        resource = await DocumentFile.findOne({ id: inputs.resourceId, isDeleted: false });
        break;
      default:
        throw 'badRequest';
    }

    if (!resource) {
      throw 'notFound';
    }

    let spaceId;
    if (inputs.resourceType === 'space') {
      spaceId = inputs.resourceId;
    } else if (inputs.resourceType === 'folder') {
      spaceId = resource.space;
    } else if (inputs.resourceType === 'file') {
      spaceId = resource.space;
    }

    const token = crypto.randomBytes(32).toString('hex');

    let passwordHash = null;
    if (inputs.password) {
      passwordHash = await bcrypt.hash(inputs.password, 10);
    }

    const shareLink = await ShareLink.create({
      token,
      resourceType: inputs.resourceType,
      resourceId: inputs.resourceId,
      isDownloadable: inputs.isDownloadable,
      isPasswordProtected: !!inputs.password,
      passwordHash,
      expiresAt: inputs.expiresAt,
      maxAccessCount: inputs.maxAccessCount,
      createdByUser: this.req.currentUser.id,
    }).fetch();

    await sails.helpers.documentActivity.logOne.with({
      user: this.req.currentUser,
      action: 'share',
      resourceType: inputs.resourceType,
      resourceId: inputs.resourceId,
      resourceName: resource.name,
      spaceId: spaceId ? String(spaceId) : null,
      metadata: {
        shareLinkId: shareLink.id,
        token: shareLink.token,
      },
      request: this.req,
    });

    return {
      item: shareLink,
    };
  },
};
