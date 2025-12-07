/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* projectTeamsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.PROJECT_TEAM_CREATE, ({ payload: { projectId, data } }) =>
      services.createProjectTeam(projectId, data),
    ),
    takeEvery(EntryActionTypes.PROJECT_TEAM_CREATE_HANDLE, ({ payload: { projectTeam } }) =>
      services.handleProjectTeamCreate(projectTeam),
    ),
    takeEvery(EntryActionTypes.PROJECT_TEAM_UPDATE, ({ payload: { id, data } }) =>
      services.updateProjectTeam(id, data),
    ),
    takeEvery(EntryActionTypes.PROJECT_TEAM_UPDATE_HANDLE, ({ payload: { projectTeam } }) =>
      services.handleProjectTeamUpdate(projectTeam),
    ),
    takeEvery(EntryActionTypes.PROJECT_TEAM_DELETE, ({ payload: { id } }) =>
      services.deleteProjectTeam(id),
    ),
    takeEvery(EntryActionTypes.PROJECT_TEAM_DELETE_HANDLE, ({ payload: { projectTeam } }) =>
      services.handleProjectTeamDelete(projectTeam),
    ),
  ]);
}
