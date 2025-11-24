/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* createFolder(spaceId, data, localId) {
  let folder;
  try {
    ({ item: folder } = yield call(request, api.createFolder, spaceId, data));
  } catch (error) {
    yield put(actions.createFolder.failure(localId, error));
    return;
  }

  yield put(actions.createFolder.success(localId, folder));
}

export function* fetchFolders(spaceId) {
  let folders;
  let included;
  try {
    ({ items: folders, included } = yield call(request, api.getFolders, spaceId));
  } catch (error) {
    yield put(actions.fetchFolders.failure(error));
    return;
  }

  yield put(actions.fetchFolders.success(folders, included));
}

export function* fetchFolder(id) {
  let folder;
  let included;
  try {
    ({ item: folder, included } = yield call(request, api.getFolder, id));
  } catch (error) {
    yield put(actions.fetchFolder.failure(error));
    return;
  }

  yield put(actions.fetchFolder.success(folder, included));
}

export function* updateFolder(id, data) {
  try {
    const { item: folder } = yield call(request, api.updateFolder, id, data);
    yield put(actions.updateFolder.success(folder));
  } catch (error) {
    yield put(actions.updateFolder.failure(error));
  }
}

export function* deleteFolder(id) {
  try {
    yield call(request, api.deleteFolder, id);
    yield put(actions.deleteFolder.success(id));
  } catch (error) {
    yield put(actions.deleteFolder.failure(error));
  }
}

export function* handleFolderCreate(folder) {
  yield put({
    type: 'FOLDER_CREATE_HANDLE',
    payload: { folder },
  });
}

export function* handleFolderUpdate(folder) {
  yield put({
    type: 'FOLDER_UPDATE_HANDLE',
    payload: { folder },
  });
}

export function* handleFolderDelete(folder) {
  yield put({
    type: 'FOLDER_DELETE_HANDLE',
    payload: { folder },
  });
}
