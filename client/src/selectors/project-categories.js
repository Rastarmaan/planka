/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';
import { createSelector as createReselectSelector } from 'reselect';

import orm from '../orm';

export const makeSelectProjectCategoryById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ ProjectCategory }, id) => {
      const projectCategoryModel = ProjectCategory.withId(id);

      if (!projectCategoryModel) {
        return projectCategoryModel;
      }

      return projectCategoryModel.ref;
    },
  );

export const selectProjectCategoryById = makeSelectProjectCategoryById();

export const selectProjectCategoriesOrderedByName = createSelector(orm, ({ ProjectCategory }) =>
  ProjectCategory.all().orderBy('name').toRefArray(),
);

export const selectProjectCategoriesForProject = createReselectSelector(
  (state) => state,
  (_, projectId) => projectId,
  (state, projectId) => {
    const selectCategories = createSelector(
      orm,
      () => projectId,
      ({ Project }, id) => {
        const projectModel = Project.withId(id);

        if (!projectModel) {
          return [];
        }

        return projectModel.categories.toModelArray().map((categoryModel) => categoryModel.ref);
      },
    );

    return selectCategories(state);
  },
);

export default {
  makeSelectProjectCategoryById,
  selectProjectCategoryById,
  selectProjectCategoriesOrderedByName,
  selectProjectCategoriesForProject,
};
