/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectFilesBySpaceId = () =>
  createSelector(
    orm,
    (_, spaceId) => spaceId,
    ({ File }, spaceId) => {
      if (!spaceId) {
        return [];
      }

      return File.filter({ spaceId }).toRefArray();
    },
  );

export const makeSelectFilesByFolderId = () =>
  createSelector(
    orm,
    (_, folderId) => folderId,
    ({ File }, folderId) => {
      if (!folderId) {
        return [];
      }

      return File.filter({ folderId }).toRefArray();
    },
  );

export const makeSelectFileById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ File }, id) => {
      const fileModel = File.withId(id);

      if (!fileModel) {
        return fileModel;
      }

      return fileModel.ref;
    },
  );

export default {
  makeSelectFilesBySpaceId,
  makeSelectFilesByFolderId,
  makeSelectFileById,
};
