/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';

export const selectAllReports = createSelector(orm, (session) => {
  return session.Report.all()
    .toModelArray()
    .filter((report) => !report.isDeleted);
});

export const selectReportById = createSelector(
  orm,
  (_, id) => id,
  (session, id) => {
    const report = session.Report.withId(id);

    if (!report || report.isDeleted) {
      return null;
    }

    return report.ref;
  },
);

export const selectAllReportPhases = createSelector(orm, (session) => {
  return session.ReportPhase.all().toModelArray();
});

export const selectReportPhaseById = createSelector(
  orm,
  (_, id) => id,
  (session, id) => {
    const reportPhase = session.ReportPhase.withId(id);

    if (!reportPhase) {
      return null;
    }

    return reportPhase.ref;
  },
);

export const selectReportPhasesByReportId = createSelector(
  orm,
  (_, reportId) => reportId,
  (session, reportId) => {
    return session.ReportPhase.all()
      .filter((phase) => phase.reportId === reportId)
      .orderBy('position')
      .toModelArray();
  },
);

export default {
  selectAllReports,
  selectReportById,
  selectAllReportPhases,
  selectReportPhaseById,
  selectReportPhasesByReportId,
};
