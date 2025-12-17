/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const selectState = ({ projectStats }) => projectStats || { byProjectId: {} };

export const selectProjectStatsByProjectId = (state, projectId) =>
  selectState(state).byProjectId[projectId]?.data;

export const selectProjectStatsIsLoading = (state, projectId) =>
  selectState(state).byProjectId[projectId]?.isLoading || false;

export const selectProjectStatsError = (state, projectId) =>
  selectState(state).byProjectId[projectId]?.error || null;

export default {
  selectProjectStatsByProjectId,
  selectProjectStatsIsLoading,
  selectProjectStatsError,
};
