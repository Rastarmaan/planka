/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createTeamMembership = (teamId, data) => ({
  type: EntryActionTypes.TEAM_MEMBERSHIP_CREATE,
  payload: {
    teamId,
    data,
  },
});

const handleTeamMembershipCreate = (teamMembership) => ({
  type: EntryActionTypes.TEAM_MEMBERSHIP_CREATE_HANDLE,
  payload: {
    teamMembership,
  },
});

const updateTeamMembership = (id, data) => ({
  type: EntryActionTypes.TEAM_MEMBERSHIP_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleTeamMembershipUpdate = (teamMembership) => ({
  type: EntryActionTypes.TEAM_MEMBERSHIP_UPDATE_HANDLE,
  payload: {
    teamMembership,
  },
});

const deleteTeamMembership = (id) => ({
  type: EntryActionTypes.TEAM_MEMBERSHIP_DELETE,
  payload: {
    id,
  },
});

const handleTeamMembershipDelete = (teamMembership) => ({
  type: EntryActionTypes.TEAM_MEMBERSHIP_DELETE_HANDLE,
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
