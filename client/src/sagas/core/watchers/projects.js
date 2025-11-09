/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* projectsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.PROJECTS_SEARCH, ({ payload: { value } }) =>
      services.searchProjects(value),
    ),
    takeEvery(EntryActionTypes.PROJECTS_ORDER_UPDATE, ({ payload: { value } }) =>
      services.updateProjectsOrder(value),
    ),
    takeEvery(EntryActionTypes.PROJECTS_CATEGORY_FILTER_UPDATE, ({ payload: { categoryId } }) =>
      services.updateProjectsCategoryFilter(categoryId),
    ),
    takeEvery(EntryActionTypes.HIDDEN_PROJECTS_TOGGLE, ({ payload: { isVisible } }) =>
      services.toggleHiddenProjects(isVisible),
    ),
    takeEvery(EntryActionTypes.PROJECT_CREATE, ({ payload: { data } }) =>
      services.createProject(data),
    ),
    takeEvery(EntryActionTypes.PROJECT_CREATE_HANDLE, ({ payload: { project } }) =>
      services.handleProjectCreate(project),
    ),
    takeEvery(EntryActionTypes.PROJECT_UPDATE, ({ payload: { id, data } }) =>
      services.updateProject(id, data),
    ),
    takeEvery(EntryActionTypes.CURRENT_PROJECT_UPDATE, ({ payload: { data } }) =>
      services.updateCurrentProject(data),
    ),
    takeEvery(EntryActionTypes.PROJECT_UPDATE_HANDLE, ({ payload: { project } }) =>
      services.handleProjectUpdate(project),
    ),
    takeEvery(EntryActionTypes.CURRENT_PROJECT_DELETE, () => services.deleteCurrentProject()),
    takeEvery(EntryActionTypes.PROJECT_DELETE_HANDLE, ({ payload: { project } }) =>
      services.handleProjectDelete(project),
    ),
    takeEvery(
      EntryActionTypes.PROJECT_CATEGORIES_UPDATE,
      ({ payload: { projectId, categoryIds } }) =>
        services.updateProjectCategories(projectId, categoryIds),
    ),
  ]);
}
