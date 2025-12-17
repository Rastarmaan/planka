/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

const fetchProjectHistories = (projectId, search, headers) =>
  socket.get(`/projects/${projectId}/project-histories`, search ? { search } : undefined, headers);

const createProjectHistory = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/project-histories`, data, headers);

const updateProjectHistory = (id, data, headers) =>
  socket.patch(`/project-histories/${id}`, data, headers);

const deleteProjectHistory = (id, headers) =>
  socket.delete(`/project-histories/${id}`, undefined, headers);

export default {
  fetchProjectHistories,
  createProjectHistory,
  updateProjectHistory,
  deleteProjectHistory,
};
