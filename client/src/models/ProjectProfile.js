/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'ProjectProfile';

  static fields = {
    id: attr(),
    name: attr(),
    description: attr(),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'projectProfiles',
    }),
    isTemplate: attr(),
    templateId: attr(),
    createdAt: attr(),
    updatedAt: attr(),
  };

  static reducer({ type, payload }, ProjectProfile) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        ProjectProfile.all().delete();

        if (payload.projectProfiles) {
          payload.projectProfiles.forEach((profile) => {
            ProjectProfile.upsert(profile);
          });
        }

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
        if (payload.projectProfiles) {
          payload.projectProfiles.forEach((profile) => {
            ProjectProfile.upsert(profile);
          });
        }

        break;
      case ActionTypes.PROJECT_PROFILE_CREATE:
      case ActionTypes.PROJECT_PROFILE_CREATE_HANDLE:
      case ActionTypes.PROJECT_PROFILE_UPDATE__SUCCESS:
      case ActionTypes.PROJECT_PROFILE_UPDATE_HANDLE:
        ProjectProfile.upsert(payload.projectProfile);

        break;
      case ActionTypes.PROJECT_PROFILE_CREATE__SUCCESS:
        ProjectProfile.withId(payload.localId).delete();
        ProjectProfile.upsert(payload.projectProfile);

        break;
      case ActionTypes.PROJECT_PROFILE_DELETE:
        if (ProjectProfile.idExists(payload.id)) {
          ProjectProfile.withId(payload.id).deleteWithRelated();
        }

        break;
      case ActionTypes.PROJECT_PROFILE_DELETE__SUCCESS:
      case ActionTypes.PROJECT_PROFILE_DELETE_HANDLE:
        if (ProjectProfile.idExists(payload.projectProfile.id)) {
          ProjectProfile.withId(payload.projectProfile.id).deleteWithRelated();
        }

        break;
      default:
    }
  }

  deleteWithRelated() {
    this.sections.toModelArray().forEach((section) => {
      section.deleteWithRelated();
    });

    this.delete();
  }
}
