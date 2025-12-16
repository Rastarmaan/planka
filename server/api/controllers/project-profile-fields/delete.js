/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /project-profile-fields/{id}:
 *   delete:
 *     summary: Delete a field
 *     description: Soft deletes a dynamic field
 *     tags:
 *       - Project Profile Fields
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    notFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!User.isAdminLevel(currentUser)) {
      throw 'notFound';
    }

    const field = await ProjectProfileField.findOne({
      id: inputs.id,
      isDeleted: false,
    });

    if (!field) {
      throw 'notFound';
    }

    const deletedField = await sails.helpers.projectProfileFields.deleteOne.with({
      record: field,
      request: this.req,
    });

    return {
      item: deletedField,
    };
  },
};
