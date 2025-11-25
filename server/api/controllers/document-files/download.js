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
    const file = await DocumentFile.findOne({ id: inputs.id, isDeleted: false });

    if (!file) {
      throw 'notFound';
    }

    const space = await Space.findOne({
      id: file.space,
      createdByUser: this.req.currentUser.id,
    });
    if (!space) {
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
      metadata: {
        versionId: inputs.versionId,
      },
      request: this.req,
    });

    // Set response headers
    this.res.set('Content-Type', file.mimeType);
    this.res.set('Content-Disposition', `attachment; filename="${fileName}"`);

    return fileStream;
  },
};
