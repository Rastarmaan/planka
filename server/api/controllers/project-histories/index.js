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
    search: {
      type: 'string',
      allowNull: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    notFound: {
      responseType: 'notFound',
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

    const criteria = {
      project: project.id,
    };

    if (inputs.search && inputs.search.trim()) {
      criteria.text = { contains: inputs.search.trim() };
    }

    const items = await ProjectHistory.find(criteria).sort('createdAt DESC');

    return { items };
  },
};
