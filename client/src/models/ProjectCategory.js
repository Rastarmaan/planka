/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'ProjectCategory';

  static fields = {
    id: attr(),
    name: attr(),
    description: attr(),
    color: attr(),
  };

  static reducer({ type, payload }, ProjectCategory) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
      case ActionTypes.PROJECT_CATEGORIES_HANDLE:
        if (payload.projectCategories) {
          payload.projectCategories.forEach((projectCategory) => {
            ProjectCategory.upsert(projectCategory);
          });
        }

        break;
      case ActionTypes.PROJECT_CATEGORY_CREATE__SUCCESS:
      case ActionTypes.PROJECT_CATEGORY_CREATE_HANDLE:
        ProjectCategory.upsert(payload.projectCategory);

        break;
      case ActionTypes.PROJECT_CATEGORY_UPDATE:
        ProjectCategory.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.PROJECT_CATEGORY_UPDATE__SUCCESS:
      case ActionTypes.PROJECT_CATEGORY_UPDATE_HANDLE:
        ProjectCategory.upsert(payload.projectCategory);

        break;
      case ActionTypes.PROJECT_CATEGORY_DELETE:
        ProjectCategory.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.PROJECT_CATEGORY_DELETE__SUCCESS:
      case ActionTypes.PROJECT_CATEGORY_DELETE_HANDLE: {
        const projectCategoryModel = ProjectCategory.withId(payload.projectCategory.id);

        if (projectCategoryModel) {
          projectCategoryModel.deleteWithRelated();
        }

        break;
      }
      default:
    }
  }

  deleteWithRelated() {
    this.delete();
  }
}
