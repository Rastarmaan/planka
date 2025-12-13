/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /project-profile-sections/{id}:
 *   delete:
 *     summary: Delete a section
 *     description: Soft deletes a project profile section and its fields
 *     tags:
 *       - Project Profile Sections
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

    const section = await ProjectProfileSection.findOne({
      id: inputs.id,
      isDeleted: false,
    });

    if (!section) {
      throw 'notFound';
    }

    const deletedSection = await sails.helpers.projectProfileSections.deleteOne.with({
      record: section,
      request: this.req,
    });

    return {
      item: deletedSection,
    };
  },
};
