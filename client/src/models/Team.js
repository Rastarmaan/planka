/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'Team';

  static fields = {
    id: attr(),
    name: attr(),
    creatorUserId: fk({
      to: 'User',
      as: 'creatorUser',
      relatedName: 'createdTeams',
    }),
  };

  static reducer({ type, payload }, Team) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        if (payload.teams) {
          payload.teams.forEach((team) => {
            Team.upsert(team);
          });
        }

        break;
      case ActionTypes.TEAMS_FETCH__SUCCESS:
        payload.teams.forEach((team) => {
          Team.upsert(team);
        });

        break;
      case ActionTypes.TEAM_CREATE:
      case ActionTypes.TEAM_CREATE_HANDLE:
        Team.upsert(payload.team);

        break;
      case ActionTypes.TEAM_CREATE__SUCCESS: {
        const teamModel = Team.withId(payload.localId);

        if (teamModel) {
          teamModel.delete();
        }

        Team.upsert(payload.team);

        break;
      }
      case ActionTypes.TEAM_UPDATE: {
        const teamModel = Team.withId(payload.id);

        if (teamModel) {
          teamModel.update(payload.data);
        }

        break;
      }
      case ActionTypes.TEAM_UPDATE__SUCCESS:
      case ActionTypes.TEAM_UPDATE_HANDLE: {
        const teamModel = Team.withId(payload.team.id);

        if (teamModel) {
          teamModel.update(payload.team);
        }

        break;
      }
      case ActionTypes.TEAM_DELETE: {
        const teamModel = Team.withId(payload.id);

        if (teamModel) {
          teamModel.delete();
        }

        break;
      }
      case ActionTypes.TEAM_DELETE__SUCCESS:
      case ActionTypes.TEAM_DELETE_HANDLE: {
        const teamModel = Team.withId(payload.team.id);

        if (teamModel) {
          teamModel.delete();
        }

        break;
      }
      default:
    }
  }
}
