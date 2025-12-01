/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /files/{id}:
 *   delete:
 *     summary: Delete file
 *     description: Soft delete a file
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

    const { currentUser } = this.req;
    const isAdmin = currentUser.role === 'admin';

    if (!isAdmin) {
      const permissions = await DocumentPermission.find({
        user: currentUser.id,
        resourceType: 'space',
        resourceId: file.space,
        canEdit: true,
      }).limit(1);

      if (permissions.length === 0) {
        throw 'forbidden';
      }
    }

    await sails.helpers.documentFiles.deleteOne.with({
      record: file,
      user: this.req.currentUser,
      request: this.req,
    });

    return {
      item: file,
    };
  },
};
