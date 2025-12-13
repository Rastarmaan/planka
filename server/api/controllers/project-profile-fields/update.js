/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const _ = require('lodash');

/**
 * @swagger
 * /project-profile-fields/{id}:
 *   patch:
 *     summary: Update a field
 *     description: Updates a dynamic field
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
    fieldType: {
      type: 'string',
    },
    label: {
      type: 'string',
    },
    value: {
      type: 'string',
    },
    metadata: {
      type: 'json',
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

    const field = await ProjectProfileField.findOne({
      id: inputs.id,
      isDeleted: false,
    });

    if (!field) {
      throw 'notFound';
    }

    const values = _.pick(inputs, ['fieldType', 'label', 'value', 'metadata', 'position']);

    const updatedField = await sails.helpers.projectProfileFields.updateOne.with({
      record: field,
      values,
      request: this.req,
    });

    return {
      item: updatedField,
    };
  },
};
