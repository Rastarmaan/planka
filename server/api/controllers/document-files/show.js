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
    const { currentUser } = this.req;
    const isAdmin = currentUser.role === 'admin';

    const file = await DocumentFile.findOne({ id: inputs.id, isDeleted: false });

    if (!file) {
      throw 'notFound';
    }

    let hasAccess = false;

    if (isAdmin) {
      const space = await Space.findOne({
        id: file.space,
        createdByUser: currentUser.id,
      });
      hasAccess = !!space;
    } else {
      const permissions = await DocumentPermission.find({
        user: currentUser.id,
        or: [
          { resourceType: 'file', resourceId: file.id },
          { resourceType: 'folder', resourceId: file.folder || '0' },
          { resourceType: 'space', resourceId: file.space },
        ],
      }).limit(1);
      hasAccess = permissions.length > 0;
    }

    if (!hasAccess) {
      throw 'forbidden';
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
