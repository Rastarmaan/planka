/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createReport = (report) => ({
  type: ActionTypes.REPORT_CREATE,
  payload: {
    report,
  },
});

createReport.success = (localId, report) => ({
  type: ActionTypes.REPORT_CREATE__SUCCESS,
  payload: {
    localId,
    report,
  },
});

createReport.failure = (localId, error) => ({
  type: ActionTypes.REPORT_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleReportCreate = (report) => ({
  type: ActionTypes.REPORT_CREATE_HANDLE,
  payload: {
    report,
  },
});

const updateReport = (id, data) => ({
  type: ActionTypes.REPORT_UPDATE,
  payload: {
    id,
    data,
  },
});

updateReport.success = (report) => ({
  type: ActionTypes.REPORT_UPDATE__SUCCESS,
  payload: {
    report,
  },
});

updateReport.failure = (id, error) => ({
  type: ActionTypes.REPORT_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleReportUpdate = (report) => ({
  type: ActionTypes.REPORT_UPDATE_HANDLE,
  payload: {
    report,
  },
});

const deleteReport = (id) => ({
  type: ActionTypes.REPORT_DELETE,
  payload: {
    id,
  },
});

deleteReport.success = (report) => ({
  type: ActionTypes.REPORT_DELETE__SUCCESS,
  payload: {
    report,
  },
});

deleteReport.failure = (id, error) => ({
  type: ActionTypes.REPORT_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleReportDelete = (report) => ({
  type: ActionTypes.REPORT_DELETE_HANDLE,
  payload: {
    report,
  },
});

const createReportPhase = (reportPhase) => ({
  type: ActionTypes.REPORT_PHASE_CREATE,
  payload: {
    reportPhase,
  },
});

createReportPhase.success = (localId, reportPhase) => ({
  type: ActionTypes.REPORT_PHASE_CREATE__SUCCESS,
  payload: {
    localId,
    reportPhase,
  },
});

createReportPhase.failure = (localId, error) => ({
  type: ActionTypes.REPORT_PHASE_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleReportPhaseCreate = (reportPhase) => ({
  type: ActionTypes.REPORT_PHASE_CREATE_HANDLE,
  payload: {
    reportPhase,
  },
});

const updateReportPhase = (id, data) => ({
  type: ActionTypes.REPORT_PHASE_UPDATE,
  payload: {
    id,
    data,
  },
});

updateReportPhase.success = (reportPhase) => ({
  type: ActionTypes.REPORT_PHASE_UPDATE__SUCCESS,
  payload: {
    reportPhase,
  },
});

updateReportPhase.failure = (id, error) => ({
  type: ActionTypes.REPORT_PHASE_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleReportPhaseUpdate = (reportPhase) => ({
  type: ActionTypes.REPORT_PHASE_UPDATE_HANDLE,
  payload: {
    reportPhase,
  },
});

const deleteReportPhase = (id) => ({
  type: ActionTypes.REPORT_PHASE_DELETE,
  payload: {
    id,
  },
});

deleteReportPhase.success = (reportPhase) => ({
  type: ActionTypes.REPORT_PHASE_DELETE__SUCCESS,
  payload: {
    reportPhase,
  },
});

deleteReportPhase.failure = (id, error) => ({
  type: ActionTypes.REPORT_PHASE_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleReportPhaseDelete = (reportPhase) => ({
  type: ActionTypes.REPORT_PHASE_DELETE_HANDLE,
  payload: {
    reportPhase,
  },
});

export default {
  createReport,
  handleReportCreate,
  updateReport,
  handleReportUpdate,
  deleteReport,
  handleReportDelete,
  createReportPhase,
  handleReportPhaseCreate,
  updateReportPhase,
  handleReportPhaseUpdate,
  deleteReportPhase,
  handleReportPhaseDelete,
};
