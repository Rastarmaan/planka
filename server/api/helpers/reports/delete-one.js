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
    const report = await Report.updateOne(inputs.record.id).set({
      isDeleted: true,
    });

    await ReportPhase.update({
      report: inputs.record.id,
    }).set({
      isDeleted: true,
    });

    if (!report) {
      return inputs.record;
    }

    const adminUsers = await User.find({
      or: [{ role: User.Roles.ADMIN }, { role: User.Roles.MANAGER }],
    });

    adminUsers.forEach((user) => {
      sails.sockets.broadcast(
        `user:${user.id}`,
        'reportDelete',
        {
          item: report,
        },
        inputs.request,
      );
    });

    return report;
  },
};
