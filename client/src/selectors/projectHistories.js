import { createSelector } from 'redux-orm';

import orm from '../orm';

export const selectProjectHistoriesByProjectId = createSelector(
  orm,
  (_, projectId) => projectId,
  (session, projectId) => {
    if (!projectId) {
      return [];
    }

    return session.ProjectHistory.filter({ projectId })
      .orderBy((h) => h.createdAt, 'desc')
      .toRefArray();
  },
);

export default {
  selectProjectHistoriesByProjectId,
};
