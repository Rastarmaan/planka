/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'CardDependency';

  static fields = {
    id: attr(),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'dependencyRecords',
    }),
    dependsOnCardId: fk({
      to: 'Card',
      as: 'dependsOnCard',
      relatedName: 'dependentRecords',
    }),
    createdAt: attr({
      getDefault: () => new Date(),
    }),
  };

  static reducer({ type, payload }, CardDependency) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        if (payload.cardDependencies) {
          payload.cardDependencies.forEach((cardDependency) => {
            CardDependency.upsert(cardDependency);
          });
        }

        break;
      case ActionTypes.CARD_DEPENDENCY_CREATE:
        break;
      case ActionTypes.CARD_DEPENDENCY_CREATE__SUCCESS:
      case ActionTypes.CARD_DEPENDENCY_CREATE_HANDLE:
        CardDependency.upsert(payload.cardDependency);

        break;
      case ActionTypes.CARD_DEPENDENCY_DELETE:
        if (payload.id) {
          CardDependency.withId(payload.id)?.delete();
        } else if (payload.cardId && payload.dependsOnCardId) {
          const dependency = CardDependency.filter({
            cardId: payload.cardId,
            dependsOnCardId: payload.dependsOnCardId,
          }).first();
          if (dependency) {
            dependency.delete();
          }
        }

        break;
      case ActionTypes.CARD_DEPENDENCY_DELETE__SUCCESS:
      case ActionTypes.CARD_DEPENDENCY_DELETE__FAILURE:
        break;
      case ActionTypes.CARD_DEPENDENCY_DELETE_HANDLE:
        CardDependency.withId(payload.cardDependency.id)?.delete();

        break;
      default:
    }
  }
}
