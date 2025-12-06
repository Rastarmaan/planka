/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'ProjectTeam';

  static fields = {
    id: attr(),
    role: attr(),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'projectTeams',
    }),
    teamId: fk({
      to: 'Team',
      as: 'team',
      relatedName: 'projectTeams',
    }),
  };

  static reducer({ type, payload }, ProjectTeam) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        if (payload.projectTeams) {
          payload.projectTeams.forEach((projectTeam) => {
            ProjectTeam.upsert(projectTeam);
          });
        }

        break;
      case ActionTypes.PROJECT_TEAM_CREATE:
      case ActionTypes.PROJECT_TEAM_CREATE__SUCCESS:
      case ActionTypes.PROJECT_TEAM_CREATE_HANDLE:
        ProjectTeam.upsert(payload.projectTeam);

        break;
      case ActionTypes.PROJECT_TEAM_UPDATE:
      case ActionTypes.PROJECT_TEAM_UPDATE__SUCCESS:
      case ActionTypes.PROJECT_TEAM_UPDATE_HANDLE:
        ProjectTeam.withId(payload.projectTeam.id).update(payload.projectTeam);

        break;
      case ActionTypes.PROJECT_TEAM_DELETE:
      case ActionTypes.PROJECT_TEAM_DELETE__SUCCESS:
      case ActionTypes.PROJECT_TEAM_DELETE_HANDLE: {
        const projectTeamModel = ProjectTeam.withId(payload.projectTeam.id);

        if (projectTeamModel) {
          projectTeamModel.delete();
        }

        break;
      }
      default:
    }
  }
}
