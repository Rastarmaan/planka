/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createReport(data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createReport({
      ...data,
      id: localId,
    }),
  );

  let report;
  try {
    const response = yield call(request, api.createReport, data);
    report = response.item;
  } catch (error) {
    yield put(actions.createReport.failure(localId, error));
    return;
  }

  yield put(actions.createReport.success(localId, report));
}

export function* handleReportCreate(report, reportPhases) {
  yield put(actions.handleReportCreate(report, reportPhases));
}

export function* updateReport(id, data) {
  yield put(actions.updateReport(id, data));

  let report;
  try {
    ({ item: report } = yield call(request, api.updateReport, id, data));
  } catch (error) {
    yield put(actions.updateReport.failure(id, error));
    return;
  }

  yield put(actions.updateReport.success(report));
}

export function* handleReportUpdate(report) {
  yield put(actions.handleReportUpdate(report));
}

export function* deleteReport(id) {
  yield put(actions.deleteReport(id));

  let report;
  try {
    ({ item: report } = yield call(request, api.deleteReport, id));
  } catch (error) {
    yield put(actions.deleteReport.failure(id, error));
    return;
  }

  yield put(actions.deleteReport.success(report));
}

export function* handleReportDelete(report) {
  yield put(actions.handleReportDelete(report));
}

export function* createReportPhase(reportId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createReportPhase({
      ...data,
      id: localId,
      reportId,
    }),
  );

  let reportPhase;
  try {
    ({ item: reportPhase } = yield call(request, api.createReportPhase, reportId, data));
  } catch (error) {
    yield put(actions.createReportPhase.failure(localId, error));
    return;
  }

  yield put(actions.createReportPhase.success(localId, reportPhase));
}

export function* handleReportPhaseCreate(reportPhase) {
  yield put(actions.handleReportPhaseCreate(reportPhase));
}

export function* updateReportPhase(id, data) {
  yield put(actions.updateReportPhase(id, data));

  let reportPhase;
  try {
    ({ item: reportPhase } = yield call(request, api.updateReportPhase, id, data));
  } catch (error) {
    yield put(actions.updateReportPhase.failure(id, error));
    return;
  }

  yield put(actions.updateReportPhase.success(reportPhase));
}

export function* handleReportPhaseUpdate(reportPhase) {
  yield put(actions.handleReportPhaseUpdate(reportPhase));
}

export function* deleteReportPhase(id) {
  yield put(actions.deleteReportPhase(id));

  let reportPhase;
  try {
    ({ item: reportPhase } = yield call(request, api.deleteReportPhase, id));
  } catch (error) {
    yield put(actions.deleteReportPhase.failure(id, error));
    return;
  }

  yield put(actions.deleteReportPhase.success(reportPhase));
}

export function* handleReportPhaseDelete(reportPhase) {
  yield put(actions.handleReportPhaseDelete(reportPhase));
}
