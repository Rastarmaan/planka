/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createReport = (data) => ({
  type: EntryActionTypes.REPORT_CREATE,
  payload: {
    data,
  },
});

const handleReportCreate = (report, reportPhases, reportPhaseMemberships) => ({
  type: EntryActionTypes.REPORT_CREATE_HANDLE,
  payload: {
    report,
    reportPhases,
    reportPhaseMemberships,
  },
});

const updateReport = (id, data) => ({
  type: EntryActionTypes.REPORT_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleReportUpdate = (report) => ({
  type: EntryActionTypes.REPORT_UPDATE_HANDLE,
  payload: {
    report,
  },
});

const deleteReport = (id) => ({
  type: EntryActionTypes.REPORT_DELETE,
  payload: {
    id,
  },
});

const handleReportDelete = (report) => ({
  type: EntryActionTypes.REPORT_DELETE_HANDLE,
  payload: {
    report,
  },
});

const createReportPhase = (reportId, data) => ({
  type: EntryActionTypes.REPORT_PHASE_CREATE,
  payload: {
    reportId,
    data,
  },
});

const handleReportPhaseCreate = (reportPhase, reportPhaseMemberships) => ({
  type: EntryActionTypes.REPORT_PHASE_CREATE_HANDLE,
  payload: {
    reportPhase,
    reportPhaseMemberships,
  },
});

const updateReportPhase = (id, data) => ({
  type: EntryActionTypes.REPORT_PHASE_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleReportPhaseUpdate = (reportPhase, reportPhaseMemberships) => ({
  type: EntryActionTypes.REPORT_PHASE_UPDATE_HANDLE,
  payload: {
    reportPhase,
    reportPhaseMemberships,
  },
});

const deleteReportPhase = (id) => ({
  type: EntryActionTypes.REPORT_PHASE_DELETE,
  payload: {
    id,
  },
});

const handleReportPhaseDelete = (reportPhase) => ({
  type: EntryActionTypes.REPORT_PHASE_DELETE_HANDLE,
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
