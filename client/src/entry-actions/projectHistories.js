/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const fetchProjectHistories = (projectId, search) => ({
  type: EntryActionTypes.PROJECT_HISTORIES_FETCH,
  payload: {
    projectId,
    search,
  },
});

const createProjectHistory = (projectId, data) => ({
  type: EntryActionTypes.PROJECT_HISTORY_CREATE,
  payload: {
    projectId,
    data,
  },
});

const updateProjectHistory = (id, data) => ({
  type: EntryActionTypes.PROJECT_HISTORY_UPDATE,
  payload: {
    id,
    data,
  },
});

const deleteProjectHistory = (id) => ({
  type: EntryActionTypes.PROJECT_HISTORY_DELETE,
  payload: {
    id,
  },
});

const handleProjectHistoryCreate = (history) => ({
  type: EntryActionTypes.PROJECT_HISTORY_CREATE_HANDLE,
  payload: {
    history,
  },
});

const handleProjectHistoryUpdate = (history) => ({
  type: EntryActionTypes.PROJECT_HISTORY_UPDATE_HANDLE,
  payload: {
    history,
  },
});

const handleProjectHistoryDelete = (history) => ({
  type: EntryActionTypes.PROJECT_HISTORY_DELETE_HANDLE,
  payload: {
    history,
  },
});

export default {
  fetchProjectHistories,
  createProjectHistory,
  updateProjectHistory,
  deleteProjectHistory,
  handleProjectHistoryCreate,
  handleProjectHistoryUpdate,
  handleProjectHistoryDelete,
};
