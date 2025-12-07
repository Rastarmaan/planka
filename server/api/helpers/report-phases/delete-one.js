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
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    await ReportPhase.destroyOne(inputs.record.id);

    const phaseData = {
      ...inputs.record,
      reportId: inputs.record.report || inputs.record.reportId,
    };

    const adminUsers = await User.find({
      or: [{ role: User.Roles.ADMIN }, { role: User.Roles.MANAGER }],
    });

    adminUsers.forEach((user) => {
      sails.sockets.broadcast(
        `user:${user.id}`,
        'reportPhaseDelete',
        {
          item: phaseData,
        },
        inputs.request,
      );
    });

    return phaseData;
  },
};
