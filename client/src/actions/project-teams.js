/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createProjectTeam = (projectTeam) => ({
  type: ActionTypes.PROJECT_TEAM_CREATE,
  payload: {
    projectTeam,
  },
});

createProjectTeam.success = (localId, projectTeam) => ({
  type: ActionTypes.PROJECT_TEAM_CREATE__SUCCESS,
  payload: {
    localId,
    projectTeam,
  },
});

createProjectTeam.failure = (localId, error) => ({
  type: ActionTypes.PROJECT_TEAM_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleProjectTeamCreate = (projectTeam) => ({
  type: ActionTypes.PROJECT_TEAM_CREATE_HANDLE,
  payload: {
    projectTeam,
  },
});

const updateProjectTeam = (id, data) => ({
  type: ActionTypes.PROJECT_TEAM_UPDATE,
  payload: {
    id,
    data,
  },
});

updateProjectTeam.success = (projectTeam) => ({
  type: ActionTypes.PROJECT_TEAM_UPDATE__SUCCESS,
  payload: {
    projectTeam,
  },
});

updateProjectTeam.failure = (id, error) => ({
  type: ActionTypes.PROJECT_TEAM_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectTeamUpdate = (projectTeam) => ({
  type: ActionTypes.PROJECT_TEAM_UPDATE_HANDLE,
  payload: {
    projectTeam,
  },
});

const deleteProjectTeam = (id) => ({
  type: ActionTypes.PROJECT_TEAM_DELETE,
  payload: {
    id,
  },
});

deleteProjectTeam.success = (projectTeam) => ({
  type: ActionTypes.PROJECT_TEAM_DELETE__SUCCESS,
  payload: {
    projectTeam,
  },
});

deleteProjectTeam.failure = (id, error) => ({
  type: ActionTypes.PROJECT_TEAM_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectTeamDelete = (projectTeam) => ({
  type: ActionTypes.PROJECT_TEAM_DELETE_HANDLE,
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
