/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* projectCategoriesWatchers() {
  yield all([
    takeEvery(EntryActionTypes.PROJECT_CATEGORIES_GET, () => services.getProjectCategories()),
    takeEvery(EntryActionTypes.PROJECT_CATEGORY_CREATE, ({ payload: { data } }) =>
      services.createProjectCategory(data),
    ),
    takeEvery(EntryActionTypes.PROJECT_CATEGORY_UPDATE, ({ payload: { id, data } }) =>
      services.updateProjectCategory(id, data),
    ),
    takeEvery(EntryActionTypes.PROJECT_CATEGORY_DELETE, ({ payload: { id } }) =>
      services.deleteProjectCategory(id),
    ),
  ]);
}
