import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class BoardRelease extends BaseModel {
  static modelName = 'BoardRelease';

  static fields = {
    id: attr(),
    version: attr(),
    name: attr(),
    target: attr(),
    status: attr(),
    startDate: attr(),
    endDate: attr(),
    releasedAt: attr(),
    createdAt: attr(),
    updatedAt: attr(),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'releases',
    }),
  };

  static Statuses = {
    PLANNING: 'planning',
    IN_PROGRESS: 'in_progress',
    TESTING: 'testing',
    COMPLETED: 'completed',
    RELEASED: 'released',
    CANCELLED: 'cancelled',
  };

  static reducer({ type, payload }, BoardReleaseModel) {
    switch (type) {
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
      case ActionTypes.CARD_CREATE_HANDLE:
      case ActionTypes.CARD_UPDATE_HANDLE: {
        if (payload.boardReleases) {
          payload.boardReleases.forEach((boardReleaseData) => {
            BoardReleaseModel.upsert(boardReleaseData);
          });
        }
        break;
      }
      case ActionTypes.BOARD_RELEASES_FETCH__SUCCESS: {
        const { boardReleases } = payload;
        boardReleases.forEach((boardReleaseData) => {
          BoardReleaseModel.upsert(boardReleaseData);
        });
        break;
      }
      case ActionTypes.BOARD_RELEASE_CREATE_HANDLE:
      case ActionTypes.BOARD_RELEASE_CREATE__SUCCESS: {
        const { boardRelease } = payload;
        BoardReleaseModel.upsert(boardRelease);
        break;
      }
      case ActionTypes.BOARD_RELEASE_UPDATE_HANDLE:
      case ActionTypes.BOARD_RELEASE_UPDATE__SUCCESS:
      case ActionTypes.BOARD_RELEASE_STATUS_UPDATE_HANDLE:
      case ActionTypes.BOARD_RELEASE_STATUS_UPDATE__SUCCESS: {
        const { boardRelease } = payload;
        BoardReleaseModel.upsert(boardRelease);
        break;
      }
      case ActionTypes.BOARD_RELEASE_DELETE_HANDLE:
      case ActionTypes.BOARD_RELEASE_DELETE__SUCCESS: {
        const { boardRelease } = payload;
        const boardReleaseModel = BoardReleaseModel.withId(boardRelease.id);
        if (boardReleaseModel) {
          boardReleaseModel.deleteWithRelated();
        }
        break;
      }
      default:
        break;
    }
  }

  getStatusText() {
    switch (this.status) {
      case BoardRelease.Statuses.PLANNING:
        return 'Planning';
      case BoardRelease.Statuses.IN_PROGRESS:
        return 'In Progress';
      case BoardRelease.Statuses.TESTING:
        return 'Testing';
      case BoardRelease.Statuses.COMPLETED:
        return 'Completed';
      case BoardRelease.Statuses.RELEASED:
        return 'Released';
      case BoardRelease.Statuses.CANCELLED:
        return 'Cancelled';
      default:
        return this.status;
    }
  }

  isReleased() {
    return this.status === BoardRelease.Statuses.RELEASED;
  }

  canBeModified() {
    return this.status !== BoardRelease.Statuses.RELEASED;
  }

  static deleteRelated() {
    // No related entities to delete (ReleaseCard junction records handled by cascade)
  }

  deleteWithRelated() {
    BoardRelease.deleteRelated();
    this.delete();
  }
}
