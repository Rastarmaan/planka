import request from '../request';
import requests from '../requests';

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

export default {
  boardReleasesFetch,
  boardReleaseCreate,
  boardReleaseUpdate,
  boardReleaseStatusUpdate,
  boardReleaseDelete,
  releaseCardAdd,
  releaseCardRemove,
};
