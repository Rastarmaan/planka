/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const _ = require('lodash');

/**
 * @swagger
 * /project-profiles:
 *   post:
 *     summary: Create a new project profile
 *     description: Creates a new project profile with optional sections and fields
 *     tags:
 *       - Project Profiles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               projectId:
 *                 type: string
 *               isTemplate:
 *                 type: boolean
 *               templateId:
 *                 type: string
 *               sections:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Profile created successfully
 */

module.exports = {
  inputs: {
    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      defaultsTo: '',
    },
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
    },
    isTemplate: {
      type: 'boolean',
      defaultsTo: false,
    },
    templateId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
    },
    sections: {
      type: 'json',
      custom: (value) => {
        if (!_.isArray(value)) {
          return false;
        }

        return _.every(
          value,
          (section) =>
            _.isPlainObject(section) &&
            _.isString(section.name) &&
            (!_.isUndefined(section.type) ? _.isString(section.type) : true) &&
            (!_.isUndefined(section.description) ? _.isString(section.description) : true) &&
            (!_.isUndefined(section.fields) ? _.isArray(section.fields) : true),
        );
      },
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

    const values = _.pick(inputs, ['name', 'description', 'isTemplate']);

    if (inputs.projectId) {
      const project = await Project.findOne({
        id: inputs.projectId,
      });

      if (!project) {
        throw 'notFound';
      }

      values.project = project.id;
    }

    if (inputs.templateId) {
      const template = await ProjectProfile.findOne({
        id: inputs.templateId,
        isTemplate: true,
        isDeleted: false,
      });

      if (!template) {
        throw 'notFound';
      }

      values.template = template.id;
    }

    const result = await sails.helpers.projectProfiles.createOne.with({
      values,
      sections: inputs.sections,
      request: this.req,
    });

    return {
      item: result.profile,
      sections: result.sections,
      fields: result.fields,
    };
  },
};
