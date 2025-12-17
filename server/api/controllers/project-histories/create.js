/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      required: true,
    },
    text: {
      type: 'string',
      required: true,
      maxLength: 4096,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    notFound: {
      responseType: 'notFound',
    },
    validationError: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser || !['admin', 'manager'].includes(currentUser.role)) {
      throw 'notEnoughRights';
    }

    const project = await Project.findOne({ id: inputs.projectId });
    if (!project) {
      throw 'notFound';
    }

    const values = {
      text: inputs.text.trim(),
      project: project.id,
      createdByUser: currentUser.id,
    };

    const item = await ProjectHistory.create(values).fetch();

    sails.sockets.broadcast('user', 'projectHistoryCreate', { item }, this.req);

    return { item };
  },
};
