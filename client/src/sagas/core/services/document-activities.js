/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';

export default function* fetchDocumentActivities({ payload: { params } }) {
  try {
    const { items, total } = yield call(request, api.getDocumentActivities, params);

    yield put(actions.fetchDocumentActivities.success(items, total));
  } catch (error) {
    yield put(actions.fetchDocumentActivities.failure(error));
  }
}
