/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import ActionTypes from '../../../constants/ActionTypes';
import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* filesWatchers() {
  yield all([
    takeEvery(ActionTypes.FILE_UPLOAD, ({ payload: { file } }) => {
      const { id: localId, spaceId, folderId, formData } = file;
      return services.uploadFile(spaceId, formData, folderId, localId);
    }),
    takeEvery(ActionTypes.FILES_FETCH, ({ payload: { spaceId, folderId } }) =>
      services.fetchFiles(spaceId, folderId),
    ),
    takeEvery(ActionTypes.FILE_FETCH, ({ payload: { id } }) => services.fetchFile(id)),
    takeEvery(ActionTypes.FILE_UPDATE, ({ payload: { id, data } }) =>
      services.updateFile(id, data),
    ),
    takeEvery(ActionTypes.FILE_DELETE, ({ payload: { id } }) => services.deleteFile(id)),
    takeEvery(ActionTypes.FILE_DOWNLOAD, ({ payload: { id } }) => services.downloadFile(id)),
    takeEvery(EntryActionTypes.FILE_CREATE_HANDLE, ({ payload: { file } }) =>
      services.handleFileCreate(file),
    ),
    takeEvery(EntryActionTypes.FILE_UPDATE_HANDLE, ({ payload: { file } }) =>
      services.handleFileUpdate(file),
    ),
    takeEvery(EntryActionTypes.FILE_DELETE_HANDLE, ({ payload: { file } }) =>
      services.handleFileDelete(file),
    ),
  ]);
}
