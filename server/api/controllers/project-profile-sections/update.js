/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const _ = require('lodash');

/**
 * @swagger
 * /project-profile-sections/{id}:
 *   patch:
 *     summary: Update a section
 *     description: Updates a project profile section
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
    name: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    position: {
      type: 'number',
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

    const values = _.pick(inputs, ['name', 'type', 'description', 'position']);

    const updatedSection = await sails.helpers.projectProfileSections.updateOne.with({
      record: section,
      values,
      request: this.req,
    });

    return {
      item: updatedSection,
    };
  },
};
