/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* reportsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.REPORT_CREATE, ({ payload: { data } }) =>
      services.createReport(data),
    ),
    takeEvery(
      EntryActionTypes.REPORT_CREATE_HANDLE,
      ({ payload: { report, reportPhases, reportPhaseMemberships } }) =>
        services.handleReportCreate(report, reportPhases, reportPhaseMemberships),
    ),
    takeEvery(EntryActionTypes.REPORT_UPDATE, ({ payload: { id, data } }) =>
      services.updateReport(id, data),
    ),
    takeEvery(EntryActionTypes.REPORT_UPDATE_HANDLE, ({ payload: { report } }) =>
      services.handleReportUpdate(report),
    ),
    takeEvery(EntryActionTypes.REPORT_DELETE, ({ payload: { id } }) => services.deleteReport(id)),
    takeEvery(EntryActionTypes.REPORT_DELETE_HANDLE, ({ payload: { report } }) =>
      services.handleReportDelete(report),
    ),
    takeEvery(EntryActionTypes.REPORT_PHASE_CREATE, ({ payload: { reportId, data } }) =>
      services.createReportPhase(reportId, data),
    ),
    takeEvery(
      EntryActionTypes.REPORT_PHASE_CREATE_HANDLE,
      ({ payload: { reportPhase, reportPhaseMemberships } }) =>
        services.handleReportPhaseCreate(reportPhase, reportPhaseMemberships),
    ),
    takeEvery(EntryActionTypes.REPORT_PHASE_UPDATE, ({ payload: { id, data } }) =>
      services.updateReportPhase(id, data),
    ),
    takeEvery(
      EntryActionTypes.REPORT_PHASE_UPDATE_HANDLE,
      ({ payload: { reportPhase, reportPhaseMemberships } }) =>
        services.handleReportPhaseUpdate(reportPhase, reportPhaseMemberships),
    ),
    takeEvery(EntryActionTypes.REPORT_PHASE_DELETE, ({ payload: { id } }) =>
      services.deleteReportPhase(id),
    ),
    takeEvery(EntryActionTypes.REPORT_PHASE_DELETE_HANDLE, ({ payload: { reportPhase } }) =>
      services.handleReportPhaseDelete(reportPhase),
    ),
  ]);
}
