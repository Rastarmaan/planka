/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';

export const selectMembershipsByPhaseId = createSelector(
  orm,
  (_, phaseId) => phaseId,
  ({ ReportPhaseMembership }, phaseId) => ReportPhaseMembership.filter({ phaseId }).toRefArray(),
);

export default {
  selectMembershipsByPhaseId,
};
