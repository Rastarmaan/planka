/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
      type: 'json',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const phase = await ReportPhase.create(inputs.values).fetch();

    const phaseData = {
      ...phase,
      reportId: phase.report,
    };

    const adminUsers = await User.find({
      or: [{ role: User.Roles.ADMIN }, { role: User.Roles.MANAGER }],
    });

    adminUsers.forEach((user) => {
      sails.sockets.broadcast(
        `user:${user.id}`,
        'reportPhaseCreate',
        {
          item: phaseData,
        },
        inputs.request,
      );
    });

    return phaseData;
  },
};
