/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const uploadFile = (file) => ({
  type: ActionTypes.FILE_UPLOAD,
  payload: {
    file,
  },
});

uploadFile.success = (localId, file) => ({
  type: ActionTypes.FILE_UPLOAD__SUCCESS,
  payload: {
    localId,
    file,
  },
});

uploadFile.failure = (localId, error) => ({
  type: ActionTypes.FILE_UPLOAD__FAILURE,
  payload: {
    localId,
    error,
  },
});

const fetchFiles = (spaceId, folderId) => ({
  type: ActionTypes.FILES_FETCH,
  payload: {
    spaceId,
    folderId,
  },
});

fetchFiles.success = (files) => ({
  type: ActionTypes.FILES_FETCH__SUCCESS,
  payload: {
    files,
  },
});

fetchFiles.failure = (error) => ({
  type: ActionTypes.FILES_FETCH__FAILURE,
  payload: {
    error,
  },
});

const fetchFile = (id) => ({
  type: ActionTypes.FILE_FETCH,
  payload: {
    id,
  },
});

fetchFile.success = (file) => ({
  type: ActionTypes.FILE_FETCH__SUCCESS,
  payload: {
    file,
  },
});

fetchFile.failure = (error) => ({
  type: ActionTypes.FILE_FETCH__FAILURE,
  payload: {
    error,
  },
});

const updateFile = (id, data) => ({
  type: ActionTypes.FILE_UPDATE,
  payload: {
    id,
    data,
  },
});

updateFile.success = (file) => ({
  type: ActionTypes.FILE_UPDATE__SUCCESS,
  payload: {
    file,
  },
});

updateFile.failure = (error) => ({
  type: ActionTypes.FILE_UPDATE__FAILURE,
  payload: {
    error,
  },
});

const deleteFile = (id) => ({
  type: ActionTypes.FILE_DELETE,
  payload: {
    id,
  },
});

deleteFile.success = (id) => ({
  type: ActionTypes.FILE_DELETE__SUCCESS,
  payload: {
    id,
  },
});

deleteFile.failure = (error) => ({
  type: ActionTypes.FILE_DELETE__FAILURE,
  payload: {
    error,
  },
});

const downloadFile = (id) => ({
  type: ActionTypes.FILE_DOWNLOAD,
  payload: {
    id,
  },
});

export default {
  uploadFile,
  fetchFiles,
  fetchFile,
  updateFile,
  deleteFile,
  downloadFile,
};
