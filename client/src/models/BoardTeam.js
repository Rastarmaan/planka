/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'BoardTeam';

  static fields = {
    id: attr(),
    role: attr(),
    canComment: attr(),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'boardTeams',
    }),
    teamId: fk({
      to: 'Team',
      as: 'team',
      relatedName: 'boardTeams',
    }),
  };

  static reducer({ type, payload }, BoardTeam) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        if (payload.boardTeams) {
          payload.boardTeams.forEach((boardTeam) => {
            BoardTeam.upsert(boardTeam);
          });
        }

        break;
      case ActionTypes.BOARD_TEAMS_FETCH__SUCCESS:
        payload.boardTeams.forEach((boardTeam) => {
          BoardTeam.upsert(boardTeam);
        });

        break;
      case ActionTypes.BOARD_TEAM_CREATE:
      case ActionTypes.BOARD_TEAM_CREATE_HANDLE:
        BoardTeam.upsert(payload.boardTeam);

        break;
      case ActionTypes.BOARD_TEAM_CREATE__SUCCESS: {
        const boardTeamModel = BoardTeam.withId(payload.localId);

        if (boardTeamModel) {
          boardTeamModel.delete();
        }

        BoardTeam.upsert(payload.boardTeam);

        break;
      }
      case ActionTypes.BOARD_TEAM_UPDATE: {
        const boardTeamModel = BoardTeam.withId(payload.id);

        if (boardTeamModel) {
          boardTeamModel.update(payload.data);
        }

        break;
      }
      case ActionTypes.BOARD_TEAM_UPDATE__SUCCESS:
      case ActionTypes.BOARD_TEAM_UPDATE_HANDLE: {
        const boardTeamModel = BoardTeam.withId(payload.boardTeam.id);

        if (boardTeamModel) {
          boardTeamModel.update(payload.boardTeam);
        }

        break;
      }
      case ActionTypes.BOARD_TEAM_DELETE: {
        const boardTeamModel = BoardTeam.withId(payload.id);

        if (boardTeamModel) {
          boardTeamModel.delete();
        }

        break;
      }
      case ActionTypes.BOARD_TEAM_DELETE__SUCCESS:
      case ActionTypes.BOARD_TEAM_DELETE_HANDLE: {
        const boardTeamModel = BoardTeam.withId(payload.boardTeam.id);

        if (boardTeamModel) {
          boardTeamModel.delete();
        }

        break;
      }
      default:
    }
  }
}
