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
    phases: {
      type: 'json',
      defaultsTo: [],
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const report = await Report.create(inputs.values).fetch();

    const createdPhases = [];
    if (inputs.phases && inputs.phases.length > 0) {
      const phasePromises = inputs.phases.map((phaseData, i) =>
        ReportPhase.create({
          report: report.id,
          name: phaseData.name,
          description: phaseData.description || '',
          startDate: phaseData.startDate || null,
          endDate: phaseData.endDate || null,
          position: i,
        }).fetch(),
      );
      const phases = await Promise.all(phasePromises);

      createdPhases.push(
        ...phases.map((phase) => ({
          ...phase,
          reportId: phase.report,
        })),
      );
    }

    const adminUsers = await User.find({
      or: [{ role: User.Roles.ADMIN }, { role: User.Roles.MANAGER }],
    });

    adminUsers.forEach((user) => {
      sails.sockets.broadcast(
        `user:${user.id}`,
        'reportCreate',
        {
          item: report,
          included: {
            reportPhases: createdPhases,
          },
        },
        inputs.request,
      );
    });

    return {
      report,
      included: {
        reportPhases: createdPhases,
      },
    };
  },
};
