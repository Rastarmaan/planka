/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import ActionTypes from '../../../constants/ActionTypes';

export default function* documentActivitiesWatchers() {
  yield all([takeEvery(ActionTypes.DOCUMENT_ACTIVITIES_FETCH, services.fetchDocumentActivities)]);
}
