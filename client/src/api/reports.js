/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const getReports = (headers) => socket.get('/reports', undefined, headers);

const createReport = (data, headers) => socket.post('/reports', data, headers);

const getReport = (id, headers) => socket.get(`/reports/${id}`, undefined, headers);

const updateReport = (id, data, headers) => socket.patch(`/reports/${id}`, data, headers);

const deleteReport = (id, headers) => socket.delete(`/reports/${id}`, undefined, headers);

const createReportPhase = (reportId, data, headers) =>
  socket.post(`/reports/${reportId}/phases`, data, headers);

const updateReportPhase = (id, data, headers) =>
  socket.patch(`/report-phases/${id}`, data, headers);

const deleteReportPhase = (id, headers) =>
  socket.delete(`/report-phases/${id}`, undefined, headers);

export default {
  getReports,
  createReport,
  getReport,
  updateReport,
  deleteReport,
  createReportPhase,
  updateReportPhase,
  deleteReportPhase,
};
