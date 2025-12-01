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
      return this.res.status(400).json({
        code: 'E_DOWNLOAD_DISABLED',
        message: 'Download not allowed for this link',
      });
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

    if (shareLink.resourceType !== ShareLink.ResourceTypes.FILE) {
      return this.res.status(400).json({
        code: 'E_NOT_FILE',
        message: 'Only file downloads are supported',
      });
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
      spaceId: file.space ? String(file.space) : null,
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
