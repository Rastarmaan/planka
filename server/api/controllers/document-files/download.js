/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /files/{id}/download:
 *   get:
 *     summary: Download file
 *     description: Download a specific file or version
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
    versionId: {
      type: 'string',
      allowNull: true,
      regex: /^\d+$/,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;
    const isAdmin = User.isAdminLevel(currentUser);

    const file = await DocumentFile.findOne({ id: inputs.id, isDeleted: false });

    if (!file) {
      throw 'notFound';
    }

    let hasAccess = false;

    if (isAdmin) {
      hasAccess = true;
    } else {
      hasAccess = await sails.helpers.permissions.checkPermission.with({
        userId: currentUser.id,
        resourceType: 'file',
        resourceId: file.id,
        permissionType: 'canDownload',
      });
    }

    if (!hasAccess) {
      throw 'forbidden';
    }

    let { storagePath } = file;
    let fileName = file.name;

    // If specific version requested
    if (inputs.versionId) {
      const version = await DocumentFileVersion.findOne({
        id: inputs.versionId,
        file: file.id,
      });

      if (!version) {
        throw 'notFound';
      }

      storagePath = version.storagePath;
      fileName = version.name;
    }

    const fileManager = sails.hooks['file-manager'].getInstance();
    const fileStream = await fileManager.read(storagePath);

    await sails.helpers.documentActivity.logOne.with({
      user: this.req.currentUser,
      action: 'download',
      resourceType: 'file',
      resourceId: file.id,
      resourceName: file.name,
      spaceId: String(file.space),
      metadata: {
        versionId: inputs.versionId,
      },
      request: this.req,
    });

    // Set response headers
    this.res.set('Content-Type', file.mimeType);

    const encodedFileName = encodeURIComponent(fileName).replace(/['()]/g, escape);
    // Check if filename contains only ASCII printable characters
    const isAscii = fileName.split('').every((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code <= 126;
    });

    if (isAscii) {
      this.res.set('Content-Disposition', `attachment; filename="${fileName}"`);
    } else {
      this.res.set('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}`);
    }

    return fileStream;
  },
};
