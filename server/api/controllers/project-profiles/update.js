/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const _ = require('lodash');

/**
 * @swagger
 * /project-profiles/{id}:
 *   patch:
 *     summary: Update a project profile
 *     description: Updates a project profile's basic information
 *     tags:
 *       - Project Profiles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
    description: {
      type: 'string',
    },
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
    },
    isTemplate: {
      type: 'boolean',
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
      id: inputs.id,
      isDeleted: false,
    });

    if (!profile) {
      throw 'notFound';
    }

    const values = _.pick(inputs, ['name', 'description', 'isTemplate']);

    if (inputs.projectId !== undefined) {
      if (inputs.projectId) {
        const project = await Project.findOne({
          id: inputs.projectId,
        });

        if (!project) {
          throw 'notFound';
        }

        values.project = project.id;
      } else {
        values.project = null;
      }
    }

    const updatedProfile = await sails.helpers.projectProfiles.updateOne.with({
      record: profile,
      values,
      request: this.req,
    });

    return {
      item: updatedProfile,
    };
  },
};
