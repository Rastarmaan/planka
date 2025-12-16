/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

module.exports = {
  inputs: {
    projectId: {
      ...idInput,
      required: true,
    },
    profileId: {
      ...idInput,
      required: true,
    },
    fieldValues: {
      type: 'json',
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

    const project = await Project.findOne({
      id: inputs.projectId,
    });

    if (!project) {
      throw 'notFound';
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw 'notFound';
    }

    const profile = await ProjectProfile.findOne({
      id: inputs.profileId,
    });

    if (!profile) {
      throw 'notFound';
    }

    // Update project's profile reference
    await Project.updateOne({ id: project.id }).set({ profileId: profile.id });

    // Save or update field values
    const fieldEntries = Object.entries(inputs.fieldValues);

    const savedData = await Promise.all(
      fieldEntries.map(async ([fieldId, value]) => {
        const existingData = await ProjectProfileData.findOne({
          project: project.id,
          field: fieldId,
        });

        if (existingData) {
          return ProjectProfileData.updateOne({ id: existingData.id }).set({ value });
        }

        return ProjectProfileData.create({
          project: project.id,
          profile: profile.id,
          field: fieldId,
          value,
        }).fetch();
      }),
    );

    return {
      items: savedData,
    };
  },
};
