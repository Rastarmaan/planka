/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'TeamMembership';

  static fields = {
    id: attr(),
    role: attr(),
    teamId: fk({
      to: 'Team',
      as: 'team',
      relatedName: 'memberships',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'teamMemberships',
    }),
  };

  static reducer({ type, payload }, TeamMembership) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        if (payload.teamMemberships) {
          payload.teamMemberships.forEach((teamMembership) => {
            TeamMembership.upsert(teamMembership);
          });
        }

        break;
      case ActionTypes.TEAMS_FETCH__SUCCESS:
        if (payload.teamMemberships) {
          payload.teamMemberships.forEach((teamMembership) => {
            TeamMembership.upsert(teamMembership);
          });
        }

        break;
      case ActionTypes.TEAM_MEMBERSHIP_CREATE:
      case ActionTypes.TEAM_MEMBERSHIP_CREATE_HANDLE:
        TeamMembership.upsert(payload.teamMembership);

        break;
      case ActionTypes.TEAM_MEMBERSHIP_CREATE__SUCCESS: {
        const teamMembershipModel = TeamMembership.withId(payload.localId);

        if (teamMembershipModel) {
          teamMembershipModel.delete();
        }

        TeamMembership.upsert(payload.teamMembership);

        break;
      }
      case ActionTypes.TEAM_MEMBERSHIP_UPDATE: {
        const teamMembershipModel = TeamMembership.withId(payload.id);

        if (teamMembershipModel) {
          teamMembershipModel.update(payload.data);
        }

        break;
      }
      case ActionTypes.TEAM_MEMBERSHIP_UPDATE__SUCCESS:
      case ActionTypes.TEAM_MEMBERSHIP_UPDATE_HANDLE: {
        const teamMembershipModel = TeamMembership.withId(payload.teamMembership.id);

        if (teamMembershipModel) {
          teamMembershipModel.update(payload.teamMembership);
        }

        break;
      }
      case ActionTypes.TEAM_MEMBERSHIP_DELETE: {
        const teamMembershipModel = TeamMembership.withId(payload.id);

        if (teamMembershipModel) {
          teamMembershipModel.delete();
        }

        break;
      }
      case ActionTypes.TEAM_MEMBERSHIP_DELETE__SUCCESS:
      case ActionTypes.TEAM_MEMBERSHIP_DELETE_HANDLE: {
        const teamMembershipModel = TeamMembership.withId(payload.teamMembership.id);

        if (teamMembershipModel) {
          teamMembershipModel.delete();
        }

        break;
      }
      default:
    }
  }
}
