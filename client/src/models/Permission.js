/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk, Model } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

export default class Permission extends Model {
  static modelName = 'Permission';

  static fields = {
    id: attr(),
    resourceType: attr(),
    resourceId: attr(),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'permissions',
    }),
    canView: attr(),
    canDownload: attr(),
    canEdit: attr(),
    canDelete: attr(),
    canShare: attr(),
    createdAt: attr(),
    updatedAt: attr(),
  };

  static reducer(action, PermissionModel) {
    switch (action.type) {
      case ActionTypes.PERMISSIONS_FETCH__SUCCESS:
        action.payload.permissions.forEach((permission) => {
          PermissionModel.upsert(permission);
        });
        break;
      case ActionTypes.PERMISSION_CREATE_HANDLE:
        PermissionModel.upsert(action.payload.permission);
        break;
      case ActionTypes.PERMISSION_DELETE_HANDLE:
        PermissionModel.withId(action.payload.permission.id).delete();
        break;
      default:
    }
  }
}
