/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import ActionTypes from '../../../constants/ActionTypes';
import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* spacesWatchers() {
  yield all([
    takeEvery(ActionTypes.SPACE_CREATE, ({ payload: { space } }) => {
      const { id: localId, ...data } = space;
      return services.createSpace(data, localId);
    }),
    takeEvery(ActionTypes.SPACES_FETCH, () => services.fetchSpaces()),
    takeEvery(ActionTypes.SPACE_FETCH, ({ payload: { id } }) => services.fetchSpace(id)),
    takeEvery(ActionTypes.SPACE_UPDATE, ({ payload: { id, data } }) =>
      services.updateSpace(id, data),
    ),
    takeEvery(ActionTypes.SPACE_DELETE, ({ payload: { id } }) => services.deleteSpace(id)),
    takeEvery(EntryActionTypes.SPACE_CREATE_HANDLE, ({ payload: { space } }) =>
      services.handleSpaceCreate(space),
    ),
    takeEvery(EntryActionTypes.SPACE_UPDATE_HANDLE, ({ payload: { space } }) =>
      services.handleSpaceUpdate(space),
    ),
    takeEvery(EntryActionTypes.SPACE_DELETE_HANDLE, ({ payload: { space } }) =>
      services.handleSpaceDelete(space),
    ),
  ]);
}
