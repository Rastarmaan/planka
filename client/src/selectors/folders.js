/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectFoldersBySpaceId = () =>
  createSelector(
    orm,
    (_, spaceId) => spaceId,
    ({ Folder }, spaceId) => {
      if (!spaceId) {
        return [];
      }

      return Folder.filter({ spaceId }).toRefArray();
    },
  );

export const makeSelectFolderById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Folder }, id) => {
      const folderModel = Folder.withId(id);

      if (!folderModel) {
        return folderModel;
      }

      return folderModel.ref;
    },
  );

export const makeSelectSubFoldersByFolderId = () =>
  createSelector(
    orm,
    (_, folderId) => folderId,
    ({ Folder }, folderId) => {
      if (!folderId) {
        return [];
      }

      return Folder.filter({ parentFolderId: folderId }).toRefArray();
    },
  );

export default {
  makeSelectFoldersBySpaceId,
  makeSelectFolderById,
  makeSelectSubFoldersByFolderId,
};
