/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createTeamMembership(teamId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createTeamMembership({
      ...data,
      teamId,
      id: localId,
    }),
  );

  let teamMembership;
  let boardMemberships;
  try {
    // prettier-ignore
    ({ item: teamMembership, included: { boardMemberships = [] } = {} } = yield call(
      request,
      api.createTeamMembership,
      teamId,
      data,
    ));
  } catch (error) {
    yield put(actions.createTeamMembership.failure(localId, error));
    return;
  }

  yield put(actions.createTeamMembership.success(localId, teamMembership, boardMemberships));
}

export function* handleTeamMembershipCreate(teamMembership) {
  yield put(actions.handleTeamMembershipCreate(teamMembership));
}

export function* updateTeamMembership(id, data) {
  yield put(actions.updateTeamMembership(id, data));

  let teamMembership;
  try {
    ({ item: teamMembership } = yield call(request, api.updateTeamMembership, id, data));
  } catch (error) {
    yield put(actions.updateTeamMembership.failure(id, error));
    return;
  }

  yield put(actions.updateTeamMembership.success(teamMembership));
}

export function* handleTeamMembershipUpdate(teamMembership) {
  yield put(actions.handleTeamMembershipUpdate(teamMembership));
}

export function* deleteTeamMembership(id) {
  yield put(actions.deleteTeamMembership(id));

  let teamMembership;
  let boardMemberships;
  try {
    // prettier-ignore
    ({ item: teamMembership, included: { boardMemberships = [] } = {} } = yield call(
      request,
      api.deleteTeamMembership,
      id,
    ));
  } catch (error) {
    yield put(actions.deleteTeamMembership.failure(id, error));
    return;
  }

  yield put(actions.deleteTeamMembership.success(teamMembership, boardMemberships));
}

export function* handleTeamMembershipDelete(teamMembership) {
  yield put(actions.handleTeamMembershipDelete(teamMembership));
}

export default {
  createTeamMembership,
  handleTeamMembershipCreate,
  updateTeamMembership,
  handleTeamMembershipUpdate,
  deleteTeamMembership,
  handleTeamMembershipDelete,
};
