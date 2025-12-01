/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import ActionTypes from '../../../constants/ActionTypes';
import services from '../services';

export default function* shareLinksWatchers() {
  yield all([
    takeEvery(ActionTypes.SHARE_LINK_CREATE, ({ payload: { data } }) =>
      services.createShareLink(data),
    ),
    takeEvery(ActionTypes.SHARE_LINKS_FETCH, ({ payload: { params } }) =>
      services.fetchShareLinks(params),
    ),
    takeEvery(ActionTypes.SHARE_LINK_DELETE, ({ payload: { id } }) => services.deleteShareLink(id)),
  ]);
}
