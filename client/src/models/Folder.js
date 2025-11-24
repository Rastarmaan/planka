/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk, Model } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

export default class Folder extends Model {
  static modelName = 'Folder';

  static fields = {
    id: attr(),
    name: attr(),
    description: attr(),
    spaceId: fk({
      to: 'Space',
      as: 'space',
      relatedName: 'folders',
    }),
    parentFolderId: fk({
      to: 'Folder',
      as: 'parentFolder',
      relatedName: 'folders',
    }),
    createdAt: attr(),
    updatedAt: attr(),
  };

  static reducer(action, FolderModel) {
    const normalizeFolder = (folder) => ({
      ...folder,
      spaceId: folder.spaceId || folder.space,
      parentFolderId: folder.parentFolderId || folder.parentFolder,
    });

    switch (action.type) {
      case ActionTypes.FOLDERS_FETCH__SUCCESS:
        action.payload.folders.forEach((folder) => {
          FolderModel.upsert(normalizeFolder(folder));
        });
        break;
      case ActionTypes.FOLDER_FETCH__SUCCESS:
        FolderModel.upsert(normalizeFolder(action.payload.folder));
        if (action.payload.included?.folders) {
          action.payload.included.folders.forEach((folder) => {
            FolderModel.upsert(normalizeFolder(folder));
          });
        }
        break;
      case ActionTypes.FOLDER_CREATE:
      case ActionTypes.FOLDER_CREATE_HANDLE:
      case ActionTypes.FOLDER_UPDATE__SUCCESS:
        FolderModel.upsert(normalizeFolder(action.payload.folder));
        break;
      case ActionTypes.FOLDER_UPDATE: {
        // Optimistic update
        const folderToUpdate = FolderModel.withId(action.payload.id);
        if (folderToUpdate) {
          folderToUpdate.update(action.payload.data);
        }
        break;
      }
      case ActionTypes.FOLDER_CREATE__SUCCESS:
        FolderModel.withId(action.payload.localId).delete();
        FolderModel.upsert(normalizeFolder(action.payload.folder));
        break;
      case ActionTypes.FOLDER_CREATE__FAILURE:
        FolderModel.withId(action.payload.localId).delete();
        break;
      case ActionTypes.FOLDER_UPDATE_HANDLE:
        FolderModel.withId(action.payload.folder.id).update(action.payload.folder);
        break;
      case ActionTypes.FOLDER_DELETE__SUCCESS:
      case ActionTypes.FOLDER_DELETE_HANDLE: {
        const deleteId = action.payload.id || action.payload.folder?.id;
        if (deleteId) {
          FolderModel.withId(deleteId).delete();
        }
        break;
      }
      default:
    }
  }
}
