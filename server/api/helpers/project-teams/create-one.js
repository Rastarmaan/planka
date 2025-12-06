/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const Roles = {
  MANAGER: 'manager',
  VIEWER: 'viewer',
};

module.exports = {
  inputs: {
    project: {
      type: 'ref',
      required: true,
    },
    team: {
      type: 'ref',
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(Roles),
      defaultsTo: Roles.VIEWER,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const projectTeam = await ProjectTeam.qm.createOne({
      projectId: inputs.project.id,
      teamId: inputs.team.id,
      role: inputs.role,
    });

    sails.sockets.broadcast(`project:${inputs.project.id}`, 'projectTeamCreate', {
      item: projectTeam,
    });

    return projectTeam;
  },
};
