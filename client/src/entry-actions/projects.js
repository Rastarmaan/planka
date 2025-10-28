/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const searchProjects = (value) => ({
  type: EntryActionTypes.PROJECTS_SEARCH,
  payload: {
    value,
  },
});

const updateProjectsOrder = (value) => ({
  type: EntryActionTypes.PROJECTS_ORDER_UPDATE,
  payload: {
    value,
  },
});

const updateProjectsCategoryFilter = (categoryId) => ({
  type: EntryActionTypes.PROJECTS_CATEGORY_FILTER_UPDATE,
  payload: {
    categoryId,
  },
});

const toggleHiddenProjects = (isVisible) => ({
  type: EntryActionTypes.HIDDEN_PROJECTS_TOGGLE,
  payload: {
    isVisible,
  },
});

const createProject = (data) => ({
  type: EntryActionTypes.PROJECT_CREATE,
  payload: {
    data,
  },
});

const handleProjectCreate = (project, included = {}) => ({
  type: EntryActionTypes.PROJECT_CREATE_HANDLE,
  payload: {
    project,
    ...included,
  },
});

const updateProject = (id, data) => ({
  type: EntryActionTypes.PROJECT_UPDATE,
  payload: {
    id,
    data,
  },
});

const updateCurrentProject = (data) => ({
  type: EntryActionTypes.CURRENT_PROJECT_UPDATE,
  payload: {
    data,
  },
});

const handleProjectUpdate = (project) => ({
  type: EntryActionTypes.PROJECT_UPDATE_HANDLE,
  payload: {
    project,
  },
});

const deleteCurrentProject = () => ({
  type: EntryActionTypes.CURRENT_PROJECT_DELETE,
  payload: {},
});

const handleProjectDelete = (project) => ({
  type: EntryActionTypes.PROJECT_DELETE_HANDLE,
  payload: {
    project,
  },
});

const updateProjectCategories = (projectId, categoryIds) => ({
  type: EntryActionTypes.PROJECT_CATEGORIES_UPDATE,
  payload: {
    projectId,
    categoryIds,
  },
});

export default {
  searchProjects,
  updateProjectsOrder,
  updateProjectsCategoryFilter,
  toggleHiddenProjects,
  createProject,
  handleProjectCreate,
  updateProject,
  updateCurrentProject,
  handleProjectUpdate,
  deleteCurrentProject,
  handleProjectDelete,
  updateProjectCategories,
};
