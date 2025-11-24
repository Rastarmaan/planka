/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createShareLink = (data) => ({
  type: ActionTypes.SHARE_LINK_CREATE,
  payload: {
    data,
  },
});

createShareLink.success = (shareLink) => ({
  type: ActionTypes.SHARE_LINK_CREATE__SUCCESS,
  payload: {
    shareLink,
  },
});

createShareLink.failure = (error) => ({
  type: ActionTypes.SHARE_LINK_CREATE__FAILURE,
  payload: {
    error,
  },
});

const fetchShareLinks = (resourceType, resourceId) => ({
  type: ActionTypes.SHARE_LINKS_FETCH,
  payload: {
    resourceType,
    resourceId,
  },
});

fetchShareLinks.success = (shareLinks) => ({
  type: ActionTypes.SHARE_LINKS_FETCH__SUCCESS,
  payload: {
    shareLinks,
  },
});

fetchShareLinks.failure = (error) => ({
  type: ActionTypes.SHARE_LINKS_FETCH__FAILURE,
  payload: {
    error,
  },
});

const deleteShareLink = (id) => ({
  type: ActionTypes.SHARE_LINK_DELETE,
  payload: {
    id,
  },
});

deleteShareLink.success = (id) => ({
  type: ActionTypes.SHARE_LINK_DELETE__SUCCESS,
  payload: {
    id,
  },
});

deleteShareLink.failure = (error) => ({
  type: ActionTypes.SHARE_LINK_DELETE__FAILURE,
  payload: {
    error,
  },
});

export default {
  createShareLink,
  fetchShareLinks,
  deleteShareLink,
};
