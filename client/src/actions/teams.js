/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const fetchTeams = () => ({
  type: ActionTypes.TEAMS_FETCH,
  payload: {},
});

fetchTeams.success = (teams, teamMemberships = []) => ({
  type: ActionTypes.TEAMS_FETCH__SUCCESS,
  payload: {
    teams,
    teamMemberships,
  },
});

fetchTeams.failure = (error) => ({
  type: ActionTypes.TEAMS_FETCH__FAILURE,
  payload: {
    error,
  },
});

const createTeam = (team) => ({
  type: ActionTypes.TEAM_CREATE,
  payload: {
    team,
  },
});

createTeam.success = (localId, team) => ({
  type: ActionTypes.TEAM_CREATE__SUCCESS,
  payload: {
    localId,
    team,
  },
});

createTeam.failure = (localId, error) => ({
  type: ActionTypes.TEAM_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleTeamCreate = (team) => ({
  type: ActionTypes.TEAM_CREATE_HANDLE,
  payload: {
    team,
  },
});

const updateTeam = (id, data) => ({
  type: ActionTypes.TEAM_UPDATE,
  payload: {
    id,
    data,
  },
});

updateTeam.success = (team) => ({
  type: ActionTypes.TEAM_UPDATE__SUCCESS,
  payload: {
    team,
  },
});

updateTeam.failure = (id, error) => ({
  type: ActionTypes.TEAM_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleTeamUpdate = (team) => ({
  type: ActionTypes.TEAM_UPDATE_HANDLE,
  payload: {
    team,
  },
});

const deleteTeam = (id) => ({
  type: ActionTypes.TEAM_DELETE,
  payload: {
    id,
  },
});

deleteTeam.success = (team) => ({
  type: ActionTypes.TEAM_DELETE__SUCCESS,
  payload: {
    team,
  },
});

deleteTeam.failure = (id, error) => ({
  type: ActionTypes.TEAM_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleTeamDelete = (team) => ({
  type: ActionTypes.TEAM_DELETE_HANDLE,
  payload: {
    team,
  },
});

export default {
  fetchTeams,
  createTeam,
  handleTeamCreate,
  updateTeam,
  handleTeamUpdate,
  deleteTeam,
  handleTeamDelete,
};
