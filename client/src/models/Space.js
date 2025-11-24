/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, Model } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

export default class Space extends Model {
  static modelName = 'Space';

  static fields = {
    id: attr(),
    name: attr(),
    description: attr(),
    createdAt: attr(),
    updatedAt: attr(),
  };

  static reducer(action, SpaceModel) {
    switch (action.type) {
      case ActionTypes.SPACES_FETCH__SUCCESS:
        action.payload.spaces.forEach((space) => {
          SpaceModel.upsert(space);
        });
        break;
      case ActionTypes.SPACE_FETCH__SUCCESS:
        SpaceModel.upsert(action.payload.space);
        break;
      case ActionTypes.SPACE_CREATE:
      case ActionTypes.SPACE_CREATE_HANDLE:
      case ActionTypes.SPACE_UPDATE__SUCCESS:
        SpaceModel.upsert(action.payload.space);
        break;
      case ActionTypes.SPACE_CREATE__SUCCESS:
        SpaceModel.withId(action.payload.localId).delete();
        SpaceModel.upsert(action.payload.space);
        break;
      case ActionTypes.SPACE_CREATE__FAILURE:
        SpaceModel.withId(action.payload.localId).delete();
        break;
      case ActionTypes.SPACE_UPDATE_HANDLE:
        SpaceModel.withId(action.payload.space.id).update(action.payload.space);
        break;
      case ActionTypes.SPACE_DELETE__SUCCESS:
      case ActionTypes.SPACE_DELETE_HANDLE: {
        const deleteId = action.payload.id || action.payload.space?.id;
        if (deleteId) {
          SpaceModel.withId(deleteId).delete();
        }
        break;
      }
      default:
    }
  }
}
