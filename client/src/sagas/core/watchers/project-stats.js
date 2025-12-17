/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* projectStatsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.PROJECT_STATS_FETCH, ({ payload: { projectId } }) =>
      services.fetchProjectStats(projectId),
    ),
  ]);
}
