import { takeEvery } from 'redux-saga/effects';

import ActionTypes from '../../../constants/ActionTypes';
import services from '../services';

export default function* boardReleasesWatchers() {
  yield takeEvery(ActionTypes.BOARD_RELEASES_FETCH, ({ payload: { boardId } }) =>
    services.boardReleasesFetch(boardId),
  );

  yield takeEvery(ActionTypes.BOARD_RELEASE_CREATE, ({ payload: { boardId, data } }) =>
    services.boardReleaseCreate(boardId, data),
  );

  yield takeEvery(ActionTypes.BOARD_RELEASE_UPDATE, ({ payload: { id, data } }) =>
    services.boardReleaseUpdate(id, data),
  );

  yield takeEvery(ActionTypes.BOARD_RELEASE_STATUS_UPDATE, ({ payload: { id, status } }) =>
    services.boardReleaseStatusUpdate(id, status),
  );

  yield takeEvery(ActionTypes.BOARD_RELEASE_DELETE, ({ payload: { id } }) =>
    services.boardReleaseDelete(id),
  );

  yield takeEvery(ActionTypes.RELEASE_CARD_ADD, ({ payload: { releaseId, cardId } }) =>
    services.releaseCardAdd(releaseId, cardId),
  );

  yield takeEvery(ActionTypes.RELEASE_CARD_REMOVE, ({ payload: { releaseId, cardId } }) =>
    services.releaseCardRemove(releaseId, cardId),
  );

  yield takeEvery(ActionTypes.RELEASE_SNAPSHOT_FETCH, ({ payload: { boardId, releaseId } }) =>
    services.releaseSnapshotFetch(boardId, releaseId),
  );
}
