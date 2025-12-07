/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* teamsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.TEAMS_FETCH, () => services.fetchTeams()),
    takeEvery(EntryActionTypes.TEAM_CREATE, ({ payload: { data } }) => services.createTeam(data)),
    takeEvery(EntryActionTypes.TEAM_CREATE_HANDLE, ({ payload: { team } }) =>
      services.handleTeamCreate(team),
    ),
    takeEvery(EntryActionTypes.TEAM_UPDATE, ({ payload: { id, data } }) =>
      services.updateTeam(id, data),
    ),
    takeEvery(EntryActionTypes.TEAM_UPDATE_HANDLE, ({ payload: { team } }) =>
      services.handleTeamUpdate(team),
    ),
    takeEvery(EntryActionTypes.TEAM_DELETE, ({ payload: { id } }) => services.deleteTeam(id)),
    takeEvery(EntryActionTypes.TEAM_DELETE_HANDLE, ({ payload: { team } }) =>
      services.handleTeamDelete(team),
    ),
  ]);
}
