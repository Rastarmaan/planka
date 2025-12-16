/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'ProjectProfileSection';

  static fields = {
    id: attr(),
    profileId: fk({
      to: 'ProjectProfile',
      as: 'profile',
      relatedName: 'sections',
    }),
    name: attr(),
    type: attr(),
    description: attr(),
    position: attr(),
    createdAt: attr(),
    updatedAt: attr(),
  };

  static reducer({ type, payload }, ProjectProfileSection) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        ProjectProfileSection.all().delete();

        if (payload.projectProfileSections) {
          payload.projectProfileSections.forEach((section) => {
            ProjectProfileSection.upsert(section);
          });
        }

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_PROFILE_CREATE_HANDLE:
        if (payload.projectProfileSections) {
          payload.projectProfileSections.forEach((section) => {
            ProjectProfileSection.upsert(section);
          });
        }

        break;
      case ActionTypes.PROJECT_PROFILE_SECTION_CREATE:
      case ActionTypes.PROJECT_PROFILE_SECTION_CREATE_HANDLE:
      case ActionTypes.PROJECT_PROFILE_SECTION_UPDATE__SUCCESS:
      case ActionTypes.PROJECT_PROFILE_SECTION_UPDATE_HANDLE:
        ProjectProfileSection.upsert(payload.projectProfileSection);

        break;
      case ActionTypes.PROJECT_PROFILE_SECTION_CREATE__SUCCESS:
        ProjectProfileSection.withId(payload.localId).delete();
        ProjectProfileSection.upsert(payload.projectProfileSection);

        break;
      case ActionTypes.PROJECT_PROFILE_SECTION_DELETE:
        if (ProjectProfileSection.idExists(payload.id)) {
          ProjectProfileSection.withId(payload.id).deleteWithRelated();
        }

        break;
      case ActionTypes.PROJECT_PROFILE_SECTION_DELETE__SUCCESS:
      case ActionTypes.PROJECT_PROFILE_SECTION_DELETE_HANDLE:
        if (ProjectProfileSection.idExists(payload.projectProfileSection.id)) {
          ProjectProfileSection.withId(payload.projectProfileSection.id).deleteWithRelated();
        }

        break;
      default:
    }
  }

  deleteWithRelated() {
    this.fields.toModelArray().forEach((field) => {
      field.delete();
    });

    this.delete();
  }
}
