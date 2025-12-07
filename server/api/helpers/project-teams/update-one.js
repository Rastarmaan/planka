/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      required: true,
    },
    project: {
      type: 'ref',
      required: true,
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
    const projectTeam = await ProjectTeam.qm.updateOne(inputs.record.id, inputs.values);

    if (projectTeam) {
      sails.sockets.broadcast(`project:${inputs.project.id}`, 'projectTeamUpdate', {
        item: projectTeam,
      });
    }

    return projectTeam;
  },
};
