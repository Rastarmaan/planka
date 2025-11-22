/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /public/{token}/download:
 *   get:
 *     summary: Download via public link
 *     description: Download file via public share link
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

    if (!shareLink.isDownloadable) {
      throw {
        message: 'Download not allowed for this link',
        code: 'E_DOWNLOAD_DISABLED',
      };
    }

    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      throw {
        message: 'Share link has expired',
        code: 'E_EXPIRED',
      };
    }

    if (shareLink.maxAccessCount && shareLink.accessCount >= shareLink.maxAccessCount) {
      throw {
        message: 'Share link access limit reached',
        code: 'E_ACCESS_LIMIT',
      };
    }

    if (shareLink.isPasswordProtected) {
      if (!inputs.password) {
        throw {
          message: 'Password required',
          code: 'E_PASSWORD_REQUIRED',
        };
      }

      const isPasswordValid = await bcrypt.compare(inputs.password, shareLink.passwordHash);
      if (!isPasswordValid) {
        throw {
          message: 'Invalid password',
          code: 'E_INVALID_PASSWORD',
        };
      }
    }

    if (shareLink.resourceType !== ShareLink.ResourceTypes.FILE) {
      throw {
        message: 'Only file downloads are supported',
        code: 'E_NOT_FILE',
      };
    }

    const file = await DocumentFile.findOne({ id: shareLink.resourceId, isDeleted: false });

    if (!file) {
      throw 'notFound';
    }

    const fileManager = sails.hooks['file-manager'].getInstance();
    const fileStream = await fileManager.read(file.storagePath);

    await sails.sendNativeQuery(
      'UPDATE share_link SET access_count = $1, last_accessed_at = $2 WHERE id = $3',
      [shareLink.accessCount + 1, new Date().toISOString(), shareLink.id],
    );

    await sails.helpers.documentActivity.logOne.with({
      user: null,
      action: 'download',
      resourceType: 'file',
      resourceId: file.id,
      resourceName: file.name,
      metadata: {
        shareLinkId: shareLink.id,
        public: true,
      },
      request: this.req,
    });

    this.res.set('Content-Type', file.mimeType);
    this.res.set('Content-Disposition', `attachment; filename="${file.name}"`);

    return fileStream;
  },
};
