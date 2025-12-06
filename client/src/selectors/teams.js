/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'reselect';
import orm from '../orm';

export const selectAllTeams = createSelector(
  (state) => state.orm,
  (ormState) => {
    const session = orm.session(ormState);
    return session.Team.all()
      .toModelArray()
      .map((team) => ({
        ...team.ref,
        memberships: team.memberships.toModelArray().map((membership) => ({
          ...membership.ref,
          user: membership.user ? membership.user.ref : null,
        })),
      }));
  },
);

export const selectTeamById = createSelector(
  (state) => state.orm,
  (state, id) => id,
  (ormState, id) => {
    const session = orm.session(ormState);
    const team = session.Team.withId(id);
    if (!team) return null;
    return {
      ...team.ref,
      memberships: team.memberships.toModelArray().map((membership) => ({
        ...membership.ref,
        user: membership.user ? membership.user.ref : null,
      })),
    };
  },
);

export const selectIsTeamsLoading = () => false;

export const selectTeamMembershipsByTeamId = createSelector(
  (state) => state.orm,
  (state, teamId) => teamId,
  (ormState, teamId) => {
    const session = orm.session(ormState);
    const team = session.Team.withId(teamId);
    if (!team) return [];
    return team.memberships.toModelArray().map((membership) => ({
      ...membership.ref,
      user: membership.user ? membership.user.ref : null,
    }));
  },
);

export const selectProjectTeamsByProjectId = createSelector(
  (state) => state.orm,
  (state, projectId) => projectId,
  (ormState, projectId) => {
    const session = orm.session(ormState);
    return session.ProjectTeam.all()
      .filter((pt) => pt.projectId === projectId)
      .toModelArray()
      .map((pt) => ({
        ...pt.ref,
        team: pt.team ? pt.team.ref : null,
      }));
  },
);

export const selectBoardTeamsByBoardId = createSelector(
  (state) => state.orm,
  (state, boardId) => boardId,
  (ormState, boardId) => {
    const session = orm.session(ormState);
    return session.BoardTeam.all()
      .filter((bt) => bt.boardId === boardId)
      .toModelArray()
      .map((bt) => ({
        ...bt.ref,
        team: bt.team ? bt.team.ref : null,
      }));
  },
);

export default {
  selectAllTeams,
  selectTeamById,
  selectIsTeamsLoading,
  selectTeamMembershipsByTeamId,
  selectProjectTeamsByProjectId,
  selectBoardTeamsByBoardId,
};
