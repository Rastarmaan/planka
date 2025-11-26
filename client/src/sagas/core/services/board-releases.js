import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import requests from '../requests';
import actions from '../../../actions';
import selectors from '../../../selectors';

export function* boardReleasesFetch(boardId) {
  yield* request(requests.boardReleasesFetchRequest, boardId);
}

export function* boardReleaseCreate(boardId, data) {
  yield* request(requests.boardReleaseCreateRequest, boardId, data);
}

export function* boardReleaseUpdate(id, data) {
  yield* request(requests.boardReleaseUpdateRequest, id, data);
}

export function* boardReleaseStatusUpdate(id, status) {
  yield* request(requests.boardReleaseStatusUpdateRequest, id, status);
}

export function* boardReleaseDelete(id) {
  yield* request(requests.boardReleaseDeleteRequest, id);
}

export function* releaseCardAdd(releaseId, cardId) {
  yield* request(requests.releaseCardAddRequest, releaseId, cardId);
}

export function* releaseCardRemove(releaseId, cardId) {
  yield* request(requests.releaseCardRemoveRequest, releaseId, cardId);
}

export function* releaseSnapshotFetch(boardId, releaseId) {
  yield* request(requests.releaseSnapshotFetchRequest, boardId, releaseId);
}

export function* addReleaseToBoardFilter(id, boardId) {
  const currentListId = yield select(selectors.selectCurrentListId);

  yield put(actions.addReleaseToBoardFilter(id, boardId, currentListId));
}

export function* addReleaseToFilterInCurrentBoard(id) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(addReleaseToBoardFilter, id, boardId);
}

export function* removeReleaseFromBoardFilter(id, boardId) {
  const currentListId = yield select(selectors.selectCurrentListId);

  yield put(actions.removeReleaseFromBoardFilter(id, boardId, currentListId));
}

export function* removeReleaseFromFilterInCurrentBoard(id) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(removeReleaseFromBoardFilter, id, boardId);
}

export default {
  boardReleasesFetch,
  boardReleaseCreate,
  boardReleaseUpdate,
  boardReleaseStatusUpdate,
  boardReleaseDelete,
  releaseCardAdd,
  releaseCardRemove,
  releaseSnapshotFetch,
  addReleaseToBoardFilter,
  addReleaseToFilterInCurrentBoard,
  removeReleaseFromBoardFilter,
  removeReleaseFromFilterInCurrentBoard,
};
