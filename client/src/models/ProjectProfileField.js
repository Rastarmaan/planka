/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'ProjectProfileField';

  static fields = {
    id: attr(),
    sectionId: fk({
      to: 'ProjectProfileSection',
      as: 'section',
      relatedName: 'fields',
    }),
    fieldType: attr(),
    label: attr(),
    value: attr(),
    metadata: attr(),
    position: attr(),
    createdAt: attr(),
    updatedAt: attr(),
  };

  static reducer({ type, payload }, ProjectProfileField) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        ProjectProfileField.all().delete();

        if (payload.projectProfileFields) {
          payload.projectProfileFields.forEach((field) => {
            ProjectProfileField.upsert(field);
          });
        }

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_PROFILE_CREATE_HANDLE:
      case ActionTypes.PROJECT_PROFILE_SECTION_CREATE_HANDLE:
        if (payload.projectProfileFields) {
          payload.projectProfileFields.forEach((field) => {
            ProjectProfileField.upsert(field);
          });
        }

        break;
      case ActionTypes.PROJECT_PROFILE_FIELD_CREATE:
      case ActionTypes.PROJECT_PROFILE_FIELD_CREATE_HANDLE:
      case ActionTypes.PROJECT_PROFILE_FIELD_UPDATE__SUCCESS:
      case ActionTypes.PROJECT_PROFILE_FIELD_UPDATE_HANDLE:
        ProjectProfileField.upsert(payload.projectProfileField);

        break;
      case ActionTypes.PROJECT_PROFILE_FIELD_CREATE__SUCCESS:
        ProjectProfileField.withId(payload.localId).delete();
        ProjectProfileField.upsert(payload.projectProfileField);

        break;
      case ActionTypes.PROJECT_PROFILE_FIELD_DELETE:
        if (ProjectProfileField.idExists(payload.id)) {
          ProjectProfileField.withId(payload.id).delete();
        }

        break;
      case ActionTypes.PROJECT_PROFILE_FIELD_DELETE__SUCCESS:
      case ActionTypes.PROJECT_PROFILE_FIELD_DELETE_HANDLE:
        if (ProjectProfileField.idExists(payload.projectProfileField.id)) {
          ProjectProfileField.withId(payload.projectProfileField.id).delete();
        }

        break;
      default:
    }
  }
}
