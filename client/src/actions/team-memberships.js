/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createTeamMembership = (teamMembership) => ({
  type: ActionTypes.TEAM_MEMBERSHIP_CREATE,
  payload: {
    teamMembership,
  },
});

createTeamMembership.success = (localId, teamMembership) => ({
  type: ActionTypes.TEAM_MEMBERSHIP_CREATE__SUCCESS,
  payload: {
    localId,
    teamMembership,
  },
});

createTeamMembership.failure = (localId, error) => ({
  type: ActionTypes.TEAM_MEMBERSHIP_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleTeamMembershipCreate = (teamMembership) => ({
  type: ActionTypes.TEAM_MEMBERSHIP_CREATE_HANDLE,
  payload: {
    teamMembership,
  },
});

const updateTeamMembership = (id, data) => ({
  type: ActionTypes.TEAM_MEMBERSHIP_UPDATE,
  payload: {
    id,
    data,
  },
});

updateTeamMembership.success = (teamMembership) => ({
  type: ActionTypes.TEAM_MEMBERSHIP_UPDATE__SUCCESS,
  payload: {
    teamMembership,
  },
});

updateTeamMembership.failure = (id, error) => ({
  type: ActionTypes.TEAM_MEMBERSHIP_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleTeamMembershipUpdate = (teamMembership) => ({
  type: ActionTypes.TEAM_MEMBERSHIP_UPDATE_HANDLE,
  payload: {
    teamMembership,
  },
});

const deleteTeamMembership = (id) => ({
  type: ActionTypes.TEAM_MEMBERSHIP_DELETE,
  payload: {
    id,
  },
});

deleteTeamMembership.success = (teamMembership) => ({
  type: ActionTypes.TEAM_MEMBERSHIP_DELETE__SUCCESS,
  payload: {
    teamMembership,
  },
});

deleteTeamMembership.failure = (id, error) => ({
  type: ActionTypes.TEAM_MEMBERSHIP_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleTeamMembershipDelete = (teamMembership) => ({
  type: ActionTypes.TEAM_MEMBERSHIP_DELETE_HANDLE,
  payload: {
    teamMembership,
  },
});

export default {
  createTeamMembership,
  handleTeamMembershipCreate,
  updateTeamMembership,
  handleTeamMembershipUpdate,
  deleteTeamMembership,
  handleTeamMembershipDelete,
};
