/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const getTeams = (headers) => socket.get('/teams', undefined, headers);

const getTeam = (id, headers) => socket.get(`/teams/${id}`, undefined, headers);

const createTeam = (data, headers) => socket.post('/teams', data, headers);

const updateTeam = (id, data, headers) => socket.patch(`/teams/${id}`, data, headers);

const deleteTeam = (id, headers) => socket.delete(`/teams/${id}`, undefined, headers);

export default {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
};
