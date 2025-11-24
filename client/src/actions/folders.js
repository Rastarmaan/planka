/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createFolder = (folder) => ({
  type: ActionTypes.FOLDER_CREATE,
  payload: {
    folder,
  },
});

createFolder.success = (localId, folder) => ({
  type: ActionTypes.FOLDER_CREATE__SUCCESS,
  payload: {
    localId,
    folder,
  },
});

createFolder.failure = (localId, error) => ({
  type: ActionTypes.FOLDER_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const fetchFolders = (spaceId) => ({
  type: ActionTypes.FOLDERS_FETCH,
  payload: {
    spaceId,
  },
});

fetchFolders.success = (folders, included) => ({
  type: ActionTypes.FOLDERS_FETCH__SUCCESS,
  payload: {
    folders,
    included,
  },
});

fetchFolders.failure = (error) => ({
  type: ActionTypes.FOLDERS_FETCH__FAILURE,
  payload: {
    error,
  },
});

const fetchFolder = (id) => ({
  type: ActionTypes.FOLDER_FETCH,
  payload: {
    id,
  },
});

fetchFolder.success = (folder, included) => ({
  type: ActionTypes.FOLDER_FETCH__SUCCESS,
  payload: {
    folder,
    included,
  },
});

fetchFolder.failure = (error) => ({
  type: ActionTypes.FOLDER_FETCH__FAILURE,
  payload: {
    error,
  },
});

const updateFolder = (id, data) => ({
  type: ActionTypes.FOLDER_UPDATE,
  payload: {
    id,
    data,
  },
});

updateFolder.success = (folder) => ({
  type: ActionTypes.FOLDER_UPDATE__SUCCESS,
  payload: {
    folder,
  },
});

updateFolder.failure = (error) => ({
  type: ActionTypes.FOLDER_UPDATE__FAILURE,
  payload: {
    error,
  },
});

const deleteFolder = (id) => ({
  type: ActionTypes.FOLDER_DELETE,
  payload: {
    id,
  },
});

deleteFolder.success = (id) => ({
  type: ActionTypes.FOLDER_DELETE__SUCCESS,
  payload: {
    id,
  },
});

deleteFolder.failure = (error) => ({
  type: ActionTypes.FOLDER_DELETE__FAILURE,
  payload: {
    error,
  },
});

export default {
  createFolder,
  fetchFolders,
  fetchFolder,
  updateFolder,
  deleteFolder,
};
