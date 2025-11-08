/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'BoardLink';

  static fields = {
    id: attr(),
    sourceBoardId: fk({
      to: 'Board',
      as: 'sourceBoard',
      relatedName: 'linkedBoards',
    }),
    linkedBoardId: fk({
      to: 'Board',
      as: 'linkedBoard',
      relatedName: 'sourceBoardLinks',
    }),
    syncEnabled: attr({
      getDefault: () => true,
    }),
    syncDirection: attr({
      getDefault: () => 'bidirectional',
    }),
    syncCards: attr({
      getDefault: () => true,
    }),
    syncMembers: attr({
      getDefault: () => true,
    }),
    syncLabels: attr({
      getDefault: () => true,
    }),
    createdAt: attr(),
    updatedAt: attr(),
  };

  static reducer({ type, payload }, BoardLink) {
    switch (type) {
      case ActionTypes.BOARD_LINK_CREATE:
      case ActionTypes.BOARD_LINK_CREATE__SUCCESS:
        BoardLink.upsert(payload.boardLink);
        break;
      case ActionTypes.BOARD_LINK_UPDATE__SUCCESS:
        BoardLink.withId(payload.boardLink.id).update(payload.boardLink);
        break;
      case ActionTypes.BOARD_LINK_DELETE__SUCCESS:
        BoardLink.withId(payload.boardLink.id).delete();
        break;
      case ActionTypes.BOARD_LINKS_FETCH__SUCCESS:
        payload.boardLinks.forEach((boardLink) => {
          BoardLink.upsert(boardLink);
        });
        break;
      default:
    }
  }
}
