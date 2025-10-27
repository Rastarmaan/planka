/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* globalLabelsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.GLOBAL_LABELS_GET, () => services.getGlobalLabels()),
    takeEvery(EntryActionTypes.GLOBAL_LABEL_CREATE, ({ payload: { data } }) =>
      services.createGlobalLabel(data),
    ),
    takeEvery(EntryActionTypes.GLOBAL_LABEL_CREATE_HANDLE, ({ payload: { label } }) =>
      services.handleGlobalLabelCreate(label),
    ),
    takeEvery(EntryActionTypes.GLOBAL_LABEL_UPDATE, ({ payload: { id, data } }) =>
      services.updateGlobalLabel(id, data),
    ),
    takeEvery(EntryActionTypes.GLOBAL_LABEL_UPDATE_HANDLE, ({ payload: { label } }) =>
      services.handleGlobalLabelUpdate(label),
    ),
    takeEvery(EntryActionTypes.GLOBAL_LABEL_DELETE, ({ payload: { id } }) =>
      services.deleteGlobalLabel(id),
    ),
    takeEvery(EntryActionTypes.GLOBAL_LABEL_DELETE_HANDLE, ({ payload: { label } }) =>
      services.handleGlobalLabelDelete(label),
    ),
  ]);
}
