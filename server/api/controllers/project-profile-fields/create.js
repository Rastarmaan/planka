/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const _ = require('lodash');

/**
 * @swagger
 * /project-profile-sections/{sectionId}/fields:
 *   post:
 *     summary: Create a new field
 *     description: Adds a new dynamic field to a section
 *     tags:
 *       - Project Profile Fields
 */

module.exports = {
  inputs: {
    sectionId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    fieldType: {
      type: 'string',
      defaultsTo: 'text',
    },
    label: {
      type: 'string',
      required: true,
    },
    value: {
      type: 'string',
      defaultsTo: '',
    },
    metadata: {
      type: 'json',
      defaultsTo: {},
    },
    position: {
      type: 'number',
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
      id: inputs.sectionId,
      isDeleted: false,
    });

    if (!section) {
      throw 'notFound';
    }

    const values = _.pick(inputs, ['fieldType', 'label', 'value', 'metadata', 'position']);
    values.section = section.id;

    const field = await sails.helpers.projectProfileFields.createOne.with({
      values,
      request: this.req,
    });

    return {
      item: field,
    };
  },
};
