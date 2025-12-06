/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* teamMembershipsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.TEAM_MEMBERSHIP_CREATE, ({ payload: { teamId, data } }) =>
      services.createTeamMembership(teamId, data),
    ),
    takeEvery(EntryActionTypes.TEAM_MEMBERSHIP_CREATE_HANDLE, ({ payload: { teamMembership } }) =>
      services.handleTeamMembershipCreate(teamMembership),
    ),
    takeEvery(EntryActionTypes.TEAM_MEMBERSHIP_UPDATE, ({ payload: { id, data } }) =>
      services.updateTeamMembership(id, data),
    ),
    takeEvery(EntryActionTypes.TEAM_MEMBERSHIP_UPDATE_HANDLE, ({ payload: { teamMembership } }) =>
      services.handleTeamMembershipUpdate(teamMembership),
    ),
    takeEvery(EntryActionTypes.TEAM_MEMBERSHIP_DELETE, ({ payload: { id } }) =>
      services.deleteTeamMembership(id),
    ),
    takeEvery(EntryActionTypes.TEAM_MEMBERSHIP_DELETE_HANDLE, ({ payload: { teamMembership } }) =>
      services.handleTeamMembershipDelete(teamMembership),
    ),
  ]);
}
