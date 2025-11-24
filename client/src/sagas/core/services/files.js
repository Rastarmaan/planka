/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* uploadFile(spaceId, formData, folderId, localId) {
  let files;
  try {
    ({ items: files } = yield call(request, api.uploadFile, spaceId, formData, folderId));
  } catch (error) {
    yield put(actions.uploadFile.failure(localId, error));
    return;
  }

  yield all(files.map((file) => put(actions.uploadFile.success(localId, file))));

  if (folderId) {
    yield put(actions.fetchFolder(folderId));
  } else {
    yield put(actions.fetchFolders(spaceId));
  }
}
export function* fetchFile(id) {
  let file;
  try {
    ({ item: file } = yield call(request, api.getFile, id));
  } catch (error) {
    yield put(actions.fetchFile.failure(error));
    return;
  }

  yield put(actions.fetchFile.success(file));
}

export function* updateFile(id, data) {
  try {
    const { item: file } = yield call(request, api.updateFile, id, data);
    yield put(actions.updateFile.success(file));
  } catch (error) {
    yield put(actions.updateFile.failure(error));
  }
}

export function* deleteFile(id) {
  try {
    yield call(request, api.deleteFile, id);
    yield put(actions.deleteFile.success(id));
  } catch (error) {
    yield put(actions.deleteFile.failure(error));
  }
}

export function* downloadFile(id) {
  try {
    const response = yield call(request, api.downloadFile, id);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `file-${id}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Download file error:', error); // eslint-disable-line no-console
  }
}

export function* handleFileCreate(file) {
  yield put({
    type: 'FILE_CREATE_HANDLE',
    payload: { file },
  });
}

export function* handleFileUpdate(file) {
  yield put({
    type: 'FILE_UPDATE_HANDLE',
    payload: { file },
  });
}

export function* handleFileDelete(file) {
  yield put({
    type: 'FILE_DELETE_HANDLE',
    payload: { file },
  });
}
