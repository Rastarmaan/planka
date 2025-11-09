/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const getProjectCategories = () => ({
  type: EntryActionTypes.PROJECT_CATEGORIES_GET,
  payload: {},
});

const createProjectCategory = (data) => ({
  type: EntryActionTypes.PROJECT_CATEGORY_CREATE,
  payload: {
    data,
  },
});

const updateProjectCategory = (id, data) => ({
  type: EntryActionTypes.PROJECT_CATEGORY_UPDATE,
  payload: {
    id,
    data,
  },
});

const deleteProjectCategory = (id) => ({
  type: EntryActionTypes.PROJECT_CATEGORY_DELETE,
  payload: {
    id,
  },
});

export default {
  getProjectCategories,
  createProjectCategory,
  updateProjectCategory,
  deleteProjectCategory,
};
