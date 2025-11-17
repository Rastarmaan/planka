import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class ReleaseCard extends BaseModel {
  static modelName = 'ReleaseCard';

  static fields = {
    id: attr(),
    releaseId: fk({
      to: 'BoardRelease',
      as: 'release',
      relatedName: 'releaseCards',
    }),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'releaseCards',
    }),
    createdAt: attr(),
    updatedAt: attr(),
  };

  static reducer({ type, payload }, ReleaseCardModel) {
    switch (type) {
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
      case ActionTypes.CARD_CREATE_HANDLE:
      case ActionTypes.CARD_UPDATE_HANDLE: {
        if (payload.releaseCards) {
          payload.releaseCards.forEach((releaseCard) => {
            ReleaseCardModel.upsert(releaseCard);
          });
        }
        break;
      }
      case ActionTypes.BOARD_RELEASES_FETCH__SUCCESS: {
        const { boardReleases } = payload;

        boardReleases.forEach((release) => {
          const existingCards = ReleaseCardModel.filter({ releaseId: release.id }).toModelArray();
          existingCards.forEach((rc) => rc.delete());
        });

        boardReleases.forEach((release) => {
          if (release.releaseCards && Array.isArray(release.releaseCards)) {
            release.releaseCards.forEach((releaseCard) => {
              ReleaseCardModel.upsert({
                ...releaseCard,
                id: String(releaseCard.id),
              });
            });
          }
        });
        break;
      }
      case ActionTypes.BOARD_RELEASE_CREATE__SUCCESS: {
        if (payload.releaseCards && Array.isArray(payload.releaseCards)) {
          payload.releaseCards.forEach((releaseCard) => {
            ReleaseCardModel.upsert(releaseCard);
          });
        }
        break;
      }
      case ActionTypes.RELEASE_CARD_CREATE_HANDLE:
      case ActionTypes.RELEASE_CARD_CREATE__SUCCESS:
      case ActionTypes.RELEASE_CARD_ADD__SUCCESS: {
        const { releaseCard } = payload;
        ReleaseCardModel.upsert(releaseCard);
        break;
      }
      case ActionTypes.RELEASE_CARD_DELETE_HANDLE:
      case ActionTypes.RELEASE_CARD_DELETE__SUCCESS:
      case ActionTypes.RELEASE_CARD_REMOVE__SUCCESS: {
        const { releaseCard } = payload;
        const releaseCardModel = ReleaseCardModel.withId(releaseCard.id);
        if (releaseCardModel) {
          releaseCardModel.delete();
        }
        break;
      }
      default:
        break;
    }
  }
}
