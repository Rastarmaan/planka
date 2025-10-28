/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const handleProjectCategories = (projectCategories) => ({
  type: ActionTypes.PROJECT_CATEGORIES_HANDLE,
  payload: {
    projectCategories,
  },
});

const createProjectCategory = (data) => ({
  type: ActionTypes.PROJECT_CATEGORY_CREATE,
  payload: {
    data,
  },
});

createProjectCategory.success = (projectCategory) => ({
  type: ActionTypes.PROJECT_CATEGORY_CREATE__SUCCESS,
  payload: {
    projectCategory,
  },
});

createProjectCategory.failure = (error) => ({
  type: ActionTypes.PROJECT_CATEGORY_CREATE__FAILURE,
  payload: {
    error,
  },
});

const handleProjectCategoryCreate = (projectCategory) => ({
  type: ActionTypes.PROJECT_CATEGORY_CREATE_HANDLE,
  payload: {
    projectCategory,
  },
});

const updateProjectCategory = (id, data) => ({
  type: ActionTypes.PROJECT_CATEGORY_UPDATE,
  payload: {
    id,
    data,
  },
});

updateProjectCategory.success = (projectCategory) => ({
  type: ActionTypes.PROJECT_CATEGORY_UPDATE__SUCCESS,
  payload: {
    projectCategory,
  },
});

updateProjectCategory.failure = (id, error) => ({
  type: ActionTypes.PROJECT_CATEGORY_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectCategoryUpdate = (projectCategory) => ({
  type: ActionTypes.PROJECT_CATEGORY_UPDATE_HANDLE,
  payload: {
    projectCategory,
  },
});

const deleteProjectCategory = (id) => ({
  type: ActionTypes.PROJECT_CATEGORY_DELETE,
  payload: {
    id,
  },
});

deleteProjectCategory.success = (projectCategory) => ({
  type: ActionTypes.PROJECT_CATEGORY_DELETE__SUCCESS,
  payload: {
    projectCategory,
  },
});

deleteProjectCategory.failure = (id, error) => ({
  type: ActionTypes.PROJECT_CATEGORY_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectCategoryDelete = (projectCategory) => ({
  type: ActionTypes.PROJECT_CATEGORY_DELETE_HANDLE,
  payload: {
    projectCategory,
  },
});

const handleProjectCategoryAssignments = ({ projectId, projectCategoryAssignments }) => ({
  type: ActionTypes.PROJECT_CATEGORY_ASSIGNMENTS_HANDLE,
  payload: {
    projectId,
    projectCategoryAssignments,
  },
});

export default {
  handleProjectCategories,
  createProjectCategory,
  handleProjectCategoryCreate,
  updateProjectCategory,
  handleProjectCategoryUpdate,
  deleteProjectCategory,
  handleProjectCategoryDelete,
  handleProjectCategoryAssignments,
};
