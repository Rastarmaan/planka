/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const _ = require('lodash');

/**
 * @swagger
 * /project-profiles/{profileId}/sections:
 *   post:
 *     summary: Create a new section
 *     description: Adds a new section to a project profile
 *     tags:
 *       - Project Profile Sections
 */

module.exports = {
  inputs: {
    profileId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    type: {
      type: 'string',
      defaultsTo: 'custom',
    },
    description: {
      type: 'string',
      defaultsTo: '',
    },
    position: {
      type: 'number',
      required: true,
    },
    fields: {
      type: 'json',
      defaultsTo: [],
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

    const profile = await ProjectProfile.findOne({
      id: inputs.profileId,
      isDeleted: false,
    });

    if (!profile) {
      throw 'notFound';
    }

    const values = _.pick(inputs, ['name', 'type', 'description', 'position']);
    values.profile = profile.id;

    const result = await sails.helpers.projectProfileSections.createOne.with({
      values,
      fields: inputs.fields,
      request: this.req,
    });

    return {
      item: result.section,
      fields: result.fields,
    };
  },
};
