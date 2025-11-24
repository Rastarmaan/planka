import ActionTypes from '../constants/ActionTypes';

export const boardReleasesFetch = (boardId) => ({
  type: ActionTypes.BOARD_RELEASES_FETCH,
  payload: {
    boardId,
  },
});

boardReleasesFetch.success = (boardId, boardReleases) => ({
  type: ActionTypes.BOARD_RELEASES_FETCH__SUCCESS,
  payload: {
    boardId,
    boardReleases,
  },
});

boardReleasesFetch.failure = (boardId, error) => ({
  type: ActionTypes.BOARD_RELEASES_FETCH__FAILURE,
  payload: {
    boardId,
    error,
  },
});

export const boardReleaseCreate = (boardId, data) => ({
  type: ActionTypes.BOARD_RELEASE_CREATE,
  payload: {
    boardId,
    data,
  },
});

boardReleaseCreate.success = (boardId, boardRelease, releaseCards) => ({
  type: ActionTypes.BOARD_RELEASE_CREATE__SUCCESS,
  payload: {
    boardId,
    boardRelease,
    releaseCards,
  },
});

boardReleaseCreate.failure = (boardId, error) => ({
  type: ActionTypes.BOARD_RELEASE_CREATE__FAILURE,
  payload: {
    boardId,
    error,
  },
});

export const boardReleaseUpdate = (id, data) => ({
  type: ActionTypes.BOARD_RELEASE_UPDATE,
  payload: {
    id,
    data,
  },
});

boardReleaseUpdate.success = (boardRelease) => ({
  type: ActionTypes.BOARD_RELEASE_UPDATE__SUCCESS,
  payload: {
    boardRelease,
  },
});

boardReleaseUpdate.failure = (id, error) => ({
  type: ActionTypes.BOARD_RELEASE_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const boardReleaseStatusUpdate = (id, status) => ({
  type: ActionTypes.BOARD_RELEASE_STATUS_UPDATE,
  payload: {
    id,
    status,
  },
});

boardReleaseStatusUpdate.success = (boardRelease) => ({
  type: ActionTypes.BOARD_RELEASE_STATUS_UPDATE__SUCCESS,
  payload: {
    boardRelease,
  },
});

boardReleaseStatusUpdate.failure = (id, error) => ({
  type: ActionTypes.BOARD_RELEASE_STATUS_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const boardReleaseDelete = (id) => ({
  type: ActionTypes.BOARD_RELEASE_DELETE,
  payload: {
    id,
  },
});

boardReleaseDelete.success = (boardRelease) => ({
  type: ActionTypes.BOARD_RELEASE_DELETE__SUCCESS,
  payload: {
    boardRelease,
  },
});

boardReleaseDelete.failure = (id, error) => ({
  type: ActionTypes.BOARD_RELEASE_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const releaseCardAdd = (releaseId, cardId) => ({
  type: ActionTypes.RELEASE_CARD_ADD,
  payload: {
    releaseId,
    cardId,
  },
});

releaseCardAdd.success = (releaseCard) => ({
  type: ActionTypes.RELEASE_CARD_ADD__SUCCESS,
  payload: {
    releaseCard,
  },
});

releaseCardAdd.failure = (releaseId, cardId, error) => ({
  type: ActionTypes.RELEASE_CARD_ADD__FAILURE,
  payload: {
    releaseId,
    cardId,
    error,
  },
});

export const releaseCardRemove = (releaseId, cardId) => ({
  type: ActionTypes.RELEASE_CARD_REMOVE,
  payload: {
    releaseId,
    cardId,
  },
});

releaseCardRemove.success = (releaseCard) => ({
  type: ActionTypes.RELEASE_CARD_REMOVE__SUCCESS,
  payload: {
    releaseCard,
  },
});

releaseCardRemove.failure = (releaseId, cardId, error) => ({
  type: ActionTypes.RELEASE_CARD_REMOVE__FAILURE,
  payload: {
    releaseId,
    cardId,
    error,
  },
});

export const releaseSnapshotViewSet = (releaseId) => ({
  type: ActionTypes.RELEASE_SNAPSHOT_VIEW_SET,
  payload: {
    releaseId,
  },
});

export const releaseSnapshotViewClear = () => ({
  type: ActionTypes.RELEASE_SNAPSHOT_VIEW_CLEAR,
  payload: {},
});

export const releaseSnapshotFetch = (boardId, releaseId) => ({
  type: ActionTypes.RELEASE_SNAPSHOT_FETCH,
  payload: {
    boardId,
    releaseId,
  },
});

releaseSnapshotFetch.success = (snapshot) => ({
  type: ActionTypes.RELEASE_SNAPSHOT_FETCH__SUCCESS,
  payload: {
    snapshot,
  },
});

releaseSnapshotFetch.failure = (error) => ({
  type: ActionTypes.RELEASE_SNAPSHOT_FETCH__FAILURE,
  payload: {
    error,
  },
});

export default {
  boardReleasesFetch,
  boardReleaseCreate,
  boardReleaseUpdate,
  boardReleaseStatusUpdate,
  boardReleaseDelete,
  releaseCardAdd,
  releaseCardRemove,
  releaseSnapshotViewSet,
  releaseSnapshotViewClear,
  releaseSnapshotFetch,
};
