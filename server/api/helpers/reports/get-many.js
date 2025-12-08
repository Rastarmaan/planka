/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {},

  async fn() {
    const reports = await Report.find({
      isDeleted: false,
    }).sort('createdAt DESC');

    const reportIds = reports.map((report) => report.id);

    const phases = await ReportPhase.find({
      report: reportIds,
      isDeleted: false,
    })
      .populate('phaseMemberships')
      .sort('position ASC');

    const reportPhases = phases.map((phase) => ({
      ...phase,
      reportId: phase.report,
      projectId: phase.project || null,
    }));

    const phaseMemberships = phases.flatMap((phase) =>
      (phase.phaseMemberships || []).map((membership) => ({
        id: membership.id,
        phaseId: phase.id,
        userId: membership.user,
        permission: membership.permission,
        createdAt: membership.createdAt,
        updatedAt: membership.updatedAt,
      })),
    );

    return {
      reports,
      reportPhases,
      reportPhaseMemberships: phaseMemberships,
    };
  },
};
