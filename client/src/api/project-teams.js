/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createProjectTeam = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/project-teams`, data, headers);

const updateProjectTeam = (id, data, headers) =>
  socket.patch(`/project-teams/${id}`, data, headers);

const deleteProjectTeam = (id, headers) =>
  socket.delete(`/project-teams/${id}`, undefined, headers);

export default {
  createProjectTeam,
  updateProjectTeam,
  deleteProjectTeam,
};
