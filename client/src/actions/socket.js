/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const handleSocketDisconnect = () => ({
  type: ActionTypes.SOCKET_DISCONNECT_HANDLE,
  payload: {},
});

const handleSocketReconnect = (
  config,
  user,
  board,
  webhooks,
  reports,
  reportPhases,
  users,
  projects,
  projectManagers,
  backgroundImages,
  baseCustomFieldGroups,
  boards,
  boardMemberships,
  labels,
  lists,
  cards,
  cardMemberships,
  cardLabels,
  taskLists,
  tasks,
  attachments,
  customFieldGroups,
  customFields,
  customFieldValues,
  notifications,
  notificationServices,
  boardReleases,
  releaseCards,
) => ({
  type: ActionTypes.SOCKET_RECONNECT_HANDLE,
  payload: {
    config,
    user,
    board,
    webhooks,
    reports,
    reportPhases,
    users,
    projects,
    projectManagers,
    backgroundImages,
    baseCustomFieldGroups,
    boards,
    boardMemberships,
    labels,
    lists,
    cards,
    cardMemberships,
    cardLabels,
    taskLists,
    tasks,
    attachments,
    customFieldGroups,
    customFields,
    customFieldValues,
    notifications,
    notificationServices,
    boardReleases,
    releaseCards,
  },
});

handleSocketReconnect.fetchCore = (currentUserId, currentBoardId) => ({
  type: ActionTypes.SOCKET_RECONNECT_HANDLE__CORE_FETCH,
  payload: {
    currentUserId,
    currentBoardId,
  },
});

export default {
  handleSocketDisconnect,
  handleSocketReconnect,
};
