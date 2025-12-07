/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const fetchTeams = () => ({
  type: EntryActionTypes.TEAMS_FETCH,
  payload: {},
});

const createTeam = (data) => ({
  type: EntryActionTypes.TEAM_CREATE,
  payload: {
    data,
  },
});

const handleTeamCreate = (team) => ({
  type: EntryActionTypes.TEAM_CREATE_HANDLE,
  payload: {
    team,
  },
});

const updateTeam = (id, data) => ({
  type: EntryActionTypes.TEAM_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleTeamUpdate = (team) => ({
  type: EntryActionTypes.TEAM_UPDATE_HANDLE,
  payload: {
    team,
  },
});

const deleteTeam = (id) => ({
  type: EntryActionTypes.TEAM_DELETE,
  payload: {
    id,
  },
});

const handleTeamDelete = (team) => ({
  type: EntryActionTypes.TEAM_DELETE_HANDLE,
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
