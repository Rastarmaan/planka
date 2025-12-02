/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk, Model } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

export default class File extends Model {
  static modelName = 'File';

  static fields = {
    id: attr(),
    name: attr(),
    description: attr(),
    mimeType: attr(),
    size: attr(),
    extension: attr(),
    spaceId: fk({
      to: 'Space',
      as: 'space',
      relatedName: 'files',
    }),
    folderId: fk({
      to: 'Folder',
      as: 'folder',
      relatedName: 'files',
    }),
    createdAt: attr(),
    updatedAt: attr(),
  };

  static reducer(action, FileModel) {
    const normalizeFile = (file) => ({
      ...file,
      spaceId: file.spaceId || file.space,
      folderId: file.folderId || file.folder,
    });

    switch (action.type) {
      case ActionTypes.FOLDERS_FETCH__SUCCESS:
        if (action.payload.included?.files) {
          action.payload.included.files.forEach((file) => {
            const normalized = normalizeFile(file);
            FileModel.upsert(normalized);
          });
        }
        break;
      case ActionTypes.FOLDER_FETCH__SUCCESS:
        if (action.payload.included?.files) {
          action.payload.included.files.forEach((file) => {
            FileModel.upsert(normalizeFile(file));
          });
        }
        break;
      case ActionTypes.FILES_FETCH__SUCCESS:
        action.payload.files.forEach((file) => {
          FileModel.upsert(normalizeFile(file));
        });
        break;
      case ActionTypes.FILE_FETCH__SUCCESS:
        FileModel.upsert(normalizeFile(action.payload.file));
        break;
      case ActionTypes.FILE_UPLOAD:
      case ActionTypes.FILE_CREATE_HANDLE:
      case ActionTypes.FILE_UPDATE__SUCCESS:
        FileModel.upsert(normalizeFile(action.payload.file));
        break;
      case ActionTypes.FILE_UPDATE: {
        // Optimistic update
        const fileToUpdate = FileModel.withId(action.payload.id);
        if (fileToUpdate) {
          fileToUpdate.update(action.payload.data);
        }
        break;
      }
      case ActionTypes.FILE_UPLOAD__SUCCESS:
        FileModel.withId(action.payload.localId).delete();
        FileModel.upsert(normalizeFile(action.payload.file));
        break;
      case ActionTypes.FILE_UPLOAD__FAILURE:
        FileModel.withId(action.payload.localId).delete();
        break;
      case ActionTypes.FILE_UPDATE_HANDLE:
        FileModel.withId(action.payload.file.id).update(action.payload.file);
        break;
      case ActionTypes.FILE_DELETE__SUCCESS:
      case ActionTypes.FILE_DELETE_HANDLE: {
        const deleteId = action.payload.id || action.payload.file?.id;
        if (deleteId) {
          const fileToDelete = FileModel.withId(deleteId);
          if (fileToDelete) {
            fileToDelete.delete();
          }
        }
        break;
      }
      default:
    }
  }
}
