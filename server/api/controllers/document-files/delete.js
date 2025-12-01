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

    const space = await Space.findOne({
      id: file.space,
      createdByUser: this.req.currentUser.id,
    });
    if (!space) {
      throw 'forbidden';
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
