/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import selectors from '../../../selectors';
import * as api from '../../../api/board-releases';
import * as actions from '../../../actions/board-releases';

export function* boardReleasesFetchRequest(boardId, headers) {
  try {
    const { items: boardReleases } = yield call(api.getBoardReleases, boardId, headers);

    yield put(actions.boardReleasesFetch.success(boardId, boardReleases));
  } catch (error) {
    yield put(actions.boardReleasesFetch.failure(boardId, error));
  }
}

export function* boardReleaseCreateRequest(boardId, data, headers) {
  try {
    const response = yield call(api.createBoardRelease, boardId, data, headers);
    const { item: boardRelease, releaseCards } = response;

    yield put(actions.boardReleaseCreate.success(boardId, boardRelease, releaseCards || []));
  } catch (error) {
    yield put(actions.boardReleaseCreate.failure(boardId, error));
  }
}

export function* boardReleaseUpdateRequest(id, data, headers) {
  try {
    const { boardId } = yield select(selectors.selectPath);
    const { item: boardRelease } = yield call(api.updateBoardRelease, boardId, id, data, headers);

    yield put(actions.boardReleaseUpdate.success(boardRelease));
  } catch (error) {
    yield put(actions.boardReleaseUpdate.failure(id, error));
  }
}

export function* boardReleaseStatusUpdateRequest(id, status, headers) {
  try {
    const { boardId } = yield select(selectors.selectPath);
    const { item: boardRelease } = yield call(
      api.updateBoardReleaseStatus,
      boardId,
      id,
      status,
      headers,
    );

    yield put(actions.boardReleaseStatusUpdate.success(boardRelease));
  } catch (error) {
    yield put(actions.boardReleaseStatusUpdate.failure(id, error));
  }
}

export function* boardReleaseDeleteRequest(id, headers) {
  try {
    const { boardId } = yield select(selectors.selectPath);
    const { item: boardRelease } = yield call(api.deleteBoardRelease, boardId, id, headers);

    yield put(actions.boardReleaseDelete.success(boardRelease));
  } catch (error) {
    yield put(actions.boardReleaseDelete.failure(id, error));
  }
}

export function* releaseCardAddRequest(releaseId, cardId, headers) {
  try {
    const { item: releaseCard } = yield call(api.addCardToRelease, releaseId, cardId, headers);

    yield put(actions.releaseCardAdd.success(releaseCard));
  } catch (error) {
    yield put(actions.releaseCardAdd.failure(releaseId, cardId, error));
  }
}

export function* releaseCardRemoveRequest(releaseId, cardId, headers) {
  try {
    const { item: releaseCard } = yield call(api.removeCardFromRelease, releaseId, cardId, headers);

    yield put(actions.releaseCardRemove.success(releaseCard));
  } catch (error) {
    yield put(actions.releaseCardRemove.failure(releaseId, cardId, error));
  }
}

export default {
  boardReleasesFetchRequest,
  boardReleaseCreateRequest,
  boardReleaseUpdateRequest,
  boardReleaseStatusUpdateRequest,
  boardReleaseDeleteRequest,
  releaseCardAddRequest,
  releaseCardRemoveRequest,
};
