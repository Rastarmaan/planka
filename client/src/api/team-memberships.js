/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createTeamMembership = (teamId, data, headers) =>
  socket.post(`/teams/${teamId}/team-memberships`, data, headers);

const updateTeamMembership = (id, data, headers) =>
  socket.patch(`/team-memberships/${id}`, data, headers);

const deleteTeamMembership = (id, headers) =>
  socket.delete(`/team-memberships/${id}`, undefined, headers);

export default {
  createTeamMembership,
  updateTeamMembership,
  deleteTeamMembership,
};
