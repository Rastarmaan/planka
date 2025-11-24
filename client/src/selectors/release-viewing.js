/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

export const selectViewingReleaseId = (state) => state.ui.releaseViewing.viewingReleaseId;

export const selectReleaseSnapshot = (state) => state.ui.releaseViewing.releaseSnapshot;

export const selectIsSnapshotLoading = (state) => state.ui.releaseViewing.isSnapshotLoading;

export default {
  selectViewingReleaseId,
  selectReleaseSnapshot,
  selectIsSnapshotLoading,
};
