/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'ProjectProfileData';

  static fields = {
    id: attr(),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'profileData',
    }),
    profileId: fk({
      to: 'ProjectProfile',
      as: 'profile',
      relatedName: 'data',
    }),
    fieldId: fk({
      to: 'ProjectProfileField',
      as: 'field',
      relatedName: 'data',
    }),
    value: attr(),
    createdAt: attr(),
    updatedAt: attr(),
  };

  static reducer({ type, payload }, ProjectProfileData) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        ProjectProfileData.all().delete();

        if (payload.projectProfileData && payload.projectProfileData.length > 0) {
          payload.projectProfileData.forEach((data) => {
            ProjectProfileData.upsert(data);
          });
        }

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_PROFILE_DATA_LOAD_HANDLE:
      case ActionTypes.PROJECT_PROFILE_DATA_SAVE_HANDLE:
        if (payload.data && payload.data.length > 0) {
          payload.data.forEach((dataItem) => {
            ProjectProfileData.upsert(dataItem);
          });
        }

        break;
      default:
    }
  }
}
