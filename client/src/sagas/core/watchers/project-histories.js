/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* projectHistoriesWatchers() {
  yield all([
    takeEvery(EntryActionTypes.PROJECT_HISTORIES_FETCH, ({ payload: { projectId, search } }) =>
      services.fetchProjectHistories(projectId, search),
    ),
    takeEvery(EntryActionTypes.PROJECT_HISTORY_CREATE, ({ payload: { projectId, data } }) =>
      services.createProjectHistory(projectId, data),
    ),
    takeEvery(EntryActionTypes.PROJECT_HISTORY_UPDATE, ({ payload: { id, data } }) =>
      services.updateProjectHistory(id, data),
    ),
    takeEvery(EntryActionTypes.PROJECT_HISTORY_DELETE, ({ payload: { id } }) =>
      services.deleteProjectHistory(id),
    ),
    takeEvery(EntryActionTypes.PROJECT_HISTORY_CREATE_HANDLE, ({ payload: { history } }) =>
      services.handleProjectHistoryCreate(history),
    ),
    takeEvery(EntryActionTypes.PROJECT_HISTORY_UPDATE_HANDLE, ({ payload: { history } }) =>
      services.handleProjectHistoryUpdate(history),
    ),
    takeEvery(EntryActionTypes.PROJECT_HISTORY_DELETE_HANDLE, ({ payload: { history } }) =>
      services.handleProjectHistoryDelete(history),
    ),
  ]);
}
