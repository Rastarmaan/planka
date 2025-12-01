/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call } from 'redux-saga/effects';

import api from '../../../api';
import request from '../request';

export function* createShareLink(data) {
  const result = yield call(request, api.createShareLink, data);
  return result;
}

export function* fetchShareLinks(params) {
  yield call(request, api.getShareLinks, params);
}

export function* deleteShareLink(id) {
  yield call(request, api.deleteShareLink, id);
}
