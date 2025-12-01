/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, Model } from 'redux-orm';
import ActionTypes from '../constants/ActionTypes';

export default class ShareLink extends Model {
  static get fields() {
    return {
      id: attr(),
      token: attr(),
      resourceType: attr(),
      resourceId: attr(),
      isDownloadable: attr({ getDefault: () => true }),
      isPasswordProtected: attr({ getDefault: () => false }),
      expiresAt: attr(),
      maxAccessCount: attr(),
      accessCount: attr({ getDefault: () => 0 }),
      isActive: attr({ getDefault: () => true }),
      lastAccessedAt: attr(),
      createdAt: attr(),
    };
  }

  static reducer(action, ShareLinkModel) {
    switch (action.type) {
      case ActionTypes.SHARE_LINK_CREATE__SUCCESS:
        ShareLinkModel.upsert(action.payload.shareLink);
        break;

      case ActionTypes.SHARE_LINKS_FETCH__SUCCESS:
        action.payload.shareLinks.forEach((shareLink) => {
          ShareLinkModel.upsert(shareLink);
        });
        break;

      case ActionTypes.SHARE_LINK_DELETE__SUCCESS:
        ShareLinkModel.withId(action.payload.id).deleteId();
        break;

      default:
    }
  }
}

ShareLink.modelName = 'ShareLink';
