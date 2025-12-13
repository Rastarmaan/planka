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
    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, project.id);

    if (!isProjectManager && !isBoardMember) {
      throw 'notFound';
    }

    const data = await ProjectProfileData.find({
      project: project.id,
    }).populate('field');

    return {
      items: data,
    };
  },
};
