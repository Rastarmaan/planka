/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const fetchProjectHistories = (projectId, search) => ({
  type: ActionTypes.PROJECT_HISTORIES_FETCH,
  payload: {
    projectId,
    search,
  },
});

fetchProjectHistories.success = (projectId, items) => ({
  type: ActionTypes.PROJECT_HISTORIES_FETCH__SUCCESS,
  payload: {
    projectId,
    items,
  },
});

fetchProjectHistories.failure = (projectId, error) => ({
  type: ActionTypes.PROJECT_HISTORIES_FETCH__FAILURE,
  payload: {
    projectId,
    error,
  },
});

const createProjectHistory = (projectId, data) => ({
  type: ActionTypes.PROJECT_HISTORY_CREATE,
  payload: {
    projectId,
    data,
  },
});

createProjectHistory.success = (item) => ({
  type: ActionTypes.PROJECT_HISTORY_CREATE__SUCCESS,
  payload: {
    item,
  },
});

createProjectHistory.failure = (error) => ({
  type: ActionTypes.PROJECT_HISTORY_CREATE__FAILURE,
  payload: {
    error,
  },
});

const handleProjectHistoryCreate = (item) => ({
  type: ActionTypes.PROJECT_HISTORY_CREATE_HANDLE,
  payload: {
    item,
  },
});

const updateProjectHistory = (id, data) => ({
  type: ActionTypes.PROJECT_HISTORY_UPDATE,
  payload: {
    id,
    data,
  },
});

updateProjectHistory.success = (item) => ({
  type: ActionTypes.PROJECT_HISTORY_UPDATE__SUCCESS,
  payload: {
    item,
  },
});

updateProjectHistory.failure = (id, error) => ({
  type: ActionTypes.PROJECT_HISTORY_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectHistoryUpdate = (item) => ({
  type: ActionTypes.PROJECT_HISTORY_UPDATE_HANDLE,
  payload: {
    item,
  },
});

const deleteProjectHistory = (id) => ({
  type: ActionTypes.PROJECT_HISTORY_DELETE,
  payload: {
    id,
  },
});

deleteProjectHistory.success = (item) => ({
  type: ActionTypes.PROJECT_HISTORY_DELETE__SUCCESS,
  payload: {
    item,
  },
});

deleteProjectHistory.failure = (id, error) => ({
  type: ActionTypes.PROJECT_HISTORY_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectHistoryDelete = (item) => ({
  type: ActionTypes.PROJECT_HISTORY_DELETE_HANDLE,
  payload: {
    item,
    deletedId: item?.id,
  },
});

export default {
  fetchProjectHistories,
  createProjectHistory,
  handleProjectHistoryCreate,
  updateProjectHistory,
  handleProjectHistoryUpdate,
  deleteProjectHistory,
  handleProjectHistoryDelete,
};
