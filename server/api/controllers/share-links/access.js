/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /public/{token}:
 *   get:
 *     summary: Access public share link
 *     description: View shared resource via public link
 *     tags:
 *       - Public Access
 */

const bcrypt = require('bcrypt');

module.exports = {
  inputs: {
    token: {
      type: 'string',
      required: true,
    },
    password: {
      type: 'string',
      allowNull: true,
    },
  },

  async fn(inputs) {
    const shareLink = await ShareLink.findOne({ token: inputs.token, isActive: true });

    if (!shareLink) {
      throw 'notFound';
    }

    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      return this.res.status(400).json({
        code: 'E_EXPIRED',
        message: 'Share link has expired',
      });
    }

    if (shareLink.maxAccessCount && shareLink.accessCount >= shareLink.maxAccessCount) {
      return this.res.status(400).json({
        code: 'E_ACCESS_LIMIT',
        message: 'Share link access limit reached',
      });
    }

    if (shareLink.isPasswordProtected) {
      if (!inputs.password) {
        return this.res.status(400).json({
          code: 'E_PASSWORD_REQUIRED',
          message: 'Password required',
        });
      }

      const isPasswordValid = await bcrypt.compare(inputs.password, shareLink.passwordHash);
      if (!isPasswordValid) {
        return this.res.status(400).json({
          code: 'E_INVALID_PASSWORD',
          message: 'Invalid password',
        });
      }
    }

    let resource;
    const included = {};

    switch (shareLink.resourceType) {
      case ShareLink.ResourceTypes.SPACE: {
        resource = await Space.findOne({ id: shareLink.resourceId, isDeleted: false });
        if (resource) {
          included.folders = await DocumentFolder.find({
            spaceId: resource.id,
            parentFolder: null,
            isDeleted: false,
          });
          included.files = await DocumentFile.find({
            spaceId: resource.id,
            folder: null,
            isDeleted: false,
          });
        }
        break;
      }
      case ShareLink.ResourceTypes.FOLDER: {
        resource = await DocumentFolder.findOne({ id: shareLink.resourceId, isDeleted: false });
        if (resource) {
          included.folders = await DocumentFolder.find({
            parentFolder: resource.id,
            isDeleted: false,
          });
          included.files = await DocumentFile.find({ folder: resource.id, isDeleted: false });
        }
        break;
      }
      case ShareLink.ResourceTypes.FILE:
        resource = await DocumentFile.findOne({ id: shareLink.resourceId, isDeleted: false });
        break;
      default:
        throw 'badRequest';
    }

    if (!resource) {
      throw 'notFound';
    }

    let spaceId;
    if (shareLink.resourceType === 'space') {
      spaceId = shareLink.resourceId;
    } else if (shareLink.resourceType === 'folder') {
      spaceId = resource.space;
    } else if (shareLink.resourceType === 'file') {
      spaceId = resource.space;
    }

    await sails.sendNativeQuery(
      'UPDATE share_link SET access_count = $1, last_accessed_at = $2 WHERE id = $3',
      [shareLink.accessCount + 1, new Date().toISOString(), shareLink.id],
    );

    await sails.helpers.documentActivity.logOne.with({
      user: null,
      action: 'read',
      resourceType: shareLink.resourceType,
      resourceId: shareLink.resourceId,
      resourceName: resource.name,
      spaceId: spaceId ? String(spaceId) : null,
      metadata: {
        shareLinkId: shareLink.id,
        public: true,
      },
      request: this.req,
    });

    return {
      item: resource,
      shareLink: {
        isDownloadable: shareLink.isDownloadable,
        resourceType: shareLink.resourceType,
        expiresAt: shareLink.expiresAt,
      },
      included,
    };
  },
};
