import { takeEvery } from 'redux-saga/effects';

import ActionTypes from '../../../constants/ActionTypes';
import EntryActionTypes from '../../../constants/EntryActionTypes';
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

  yield takeEvery(EntryActionTypes.RELEASE_TO_FILTER_IN_CURRENT_BOARD_ADD, ({ payload: { id } }) =>
    services.addReleaseToFilterInCurrentBoard(id),
  );

  yield takeEvery(
    EntryActionTypes.RELEASE_FROM_FILTER_IN_CURRENT_BOARD_REMOVE,
    ({ payload: { id } }) => services.removeReleaseFromFilterInCurrentBoard(id),
  );
}
