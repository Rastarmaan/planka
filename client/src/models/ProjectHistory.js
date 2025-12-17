/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'ProjectHistory';

  static fields = {
    id: attr(),
    text: attr(),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'histories',
    }),
    createdByUserId: fk({
      to: 'User',
      as: 'createdByUser',
      relatedName: 'createdProjectHistories',
    }),
    createdAt: attr(),
    updatedAt: attr(),
  };

  static reducer(action, ProjectHistory) {
    const { type, payload } = action;

    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        ProjectHistory.all().delete();
        if (payload.projectHistories) {
          payload.projectHistories.forEach((history) => ProjectHistory.upsert(history));
        }
        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
        if (payload.projectHistories) {
          payload.projectHistories.forEach((history) => ProjectHistory.upsert(history));
        }
        break;
      case ActionTypes.PROJECT_HISTORIES_FETCH__SUCCESS:
      case ActionTypes.PROJECT_HISTORY_CREATE_HANDLE:
      case ActionTypes.PROJECT_HISTORY_UPDATE_HANDLE:
      case ActionTypes.PROJECT_HISTORY_DELETE_HANDLE:
        if (payload.items) {
          payload.items.forEach((history) => ProjectHistory.upsert(history));
        }
        if (payload.item) {
          ProjectHistory.upsert(payload.item);
        }
        if (payload.deletedId) {
          if (ProjectHistory.idExists(payload.deletedId)) {
            ProjectHistory.withId(payload.deletedId).delete();
          }
        }
        break;
      case ActionTypes.PROJECT_HISTORY_CREATE__SUCCESS:
      case ActionTypes.PROJECT_HISTORY_UPDATE__SUCCESS:
        ProjectHistory.upsert(payload.item);
        break;
      case ActionTypes.PROJECT_HISTORY_DELETE__SUCCESS:
        if (ProjectHistory.idExists(payload.item.id)) {
          ProjectHistory.withId(payload.item.id).delete();
        }
        break;
      default:
    }
  }
}
