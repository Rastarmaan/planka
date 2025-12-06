/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
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
    const { values } = inputs;

    const team = await Team.qm.createOne({
      ...values,
      creatorUserId: inputs.actorUser.id,
    });

    // Broadcast to all users (teams are global)
    sails.sockets.broadcast('user', 'teamCreate', {
      item: team,
    });

    return team;
  },
};
