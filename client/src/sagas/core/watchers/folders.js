/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import ActionTypes from '../../../constants/ActionTypes';
import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* foldersWatchers() {
  yield all([
    takeEvery(ActionTypes.FOLDER_CREATE, ({ payload: { folder } }) => {
      const { id: localId, spaceId, ...data } = folder;
      return services.createFolder(spaceId, data, localId);
    }),
    takeEvery(ActionTypes.FOLDERS_FETCH, ({ payload: { spaceId } }) =>
      services.fetchFolders(spaceId),
    ),
    takeEvery(ActionTypes.FOLDER_FETCH, ({ payload: { id } }) => services.fetchFolder(id)),
    takeEvery(ActionTypes.FOLDER_UPDATE, ({ payload: { id, data } }) =>
      services.updateFolder(id, data),
    ),
    takeEvery(ActionTypes.FOLDER_DELETE, ({ payload: { id } }) => services.deleteFolder(id)),
    takeEvery(EntryActionTypes.FOLDER_CREATE_HANDLE, ({ payload: { folder } }) =>
      services.handleFolderCreate(folder),
    ),
    takeEvery(EntryActionTypes.FOLDER_UPDATE_HANDLE, ({ payload: { folder } }) =>
      services.handleFolderUpdate(folder),
    ),
    takeEvery(EntryActionTypes.FOLDER_DELETE_HANDLE, ({ payload: { folder } }) =>
      services.handleFolderDelete(folder),
    ),
  ]);
}
