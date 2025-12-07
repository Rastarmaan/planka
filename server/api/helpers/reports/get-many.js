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
    }).sort('position ASC');

    const reportPhases = phases.map((phase) => ({
      ...phase,
      reportId: phase.report,
    }));

    return {
      reports,
      reportPhases,
    };
  },
};
