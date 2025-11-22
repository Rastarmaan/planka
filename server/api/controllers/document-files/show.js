/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /files/{id}:
 *   get:
 *     summary: Get file metadata
 *     description: Get file information and versions
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
  },

  async fn(inputs) {
    const file = await DocumentFile.findOne({ id: inputs.id, isDeleted: false });

    if (!file) {
      throw 'notFound';
    }

    if (this.req.isSocket) {
      sails.sockets.join(this.req, `space:${file.space}`);
    }

    const versions = await DocumentFileVersion.find({ file: file.id }).sort('versionNumber DESC');

    return {
      item: file,
      included: {
        versions,
      },
    };
  },
};
