/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createProjectTeam = (projectId, data) => ({
  type: EntryActionTypes.PROJECT_TEAM_CREATE,
  payload: {
    projectId,
    data,
  },
});

const handleProjectTeamCreate = (projectTeam) => ({
  type: EntryActionTypes.PROJECT_TEAM_CREATE_HANDLE,
  payload: {
    projectTeam,
  },
});

const updateProjectTeam = (id, data) => ({
  type: EntryActionTypes.PROJECT_TEAM_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleProjectTeamUpdate = (projectTeam) => ({
  type: EntryActionTypes.PROJECT_TEAM_UPDATE_HANDLE,
  payload: {
    projectTeam,
  },
});

const deleteProjectTeam = (id) => ({
  type: EntryActionTypes.PROJECT_TEAM_DELETE,
  payload: {
    id,
  },
});

const handleProjectTeamDelete = (projectTeam) => ({
  type: EntryActionTypes.PROJECT_TEAM_DELETE_HANDLE,
  payload: {
    projectTeam,
  },
});

export default {
  createProjectTeam,
  handleProjectTeamCreate,
  updateProjectTeam,
  handleProjectTeamUpdate,
  deleteProjectTeam,
  handleProjectTeamDelete,
};
