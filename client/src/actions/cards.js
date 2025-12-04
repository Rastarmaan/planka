/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const fetchCards = (listId) => ({
  type: ActionTypes.CARDS_FETCH,
  payload: {
    listId,
  },
});

fetchCards.success = (
  listId,
  cards,
  users,
  cardMemberships,
  cardLabels,
  taskLists,
  tasks,
  attachments,
  customFieldGroups,
  customFields,
  customFieldValues,
) => ({
  type: ActionTypes.CARDS_FETCH__SUCCESS,
  payload: {
    listId,
    cards,
    users,
    cardMemberships,
    cardLabels,
    taskLists,
    tasks,
    attachments,
    customFieldGroups,
    customFields,
    customFieldValues,
  },
});

fetchCards.failure = (listId, error) => ({
  type: ActionTypes.CARDS_FETCH__FAILURE,
  payload: {
    listId,
    error,
  },
});

const handleCardsUpdate = (cards, activities) => ({
  type: ActionTypes.CARDS_UPDATE_HANDLE,
  payload: {
    cards,
    activities,
  },
});

const createCard = (card, autoOpen) => ({
  type: ActionTypes.CARD_CREATE,
  payload: {
    card,
    autoOpen,
  },
});

createCard.success = (localId, card) => ({
  type: ActionTypes.CARD_CREATE__SUCCESS,
  payload: {
    localId,
    card,
  },
});

createCard.failure = (localId, error) => ({
  type: ActionTypes.CARD_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleCardCreate = (
  card,
  users,
  cardMemberships,
  cardLabels,
  releaseCards,
  boardReleases,
  taskLists,
  tasks,
  attachments,
  customFieldGroups,
  customFields,
  customFieldValues,
) => ({
  type: ActionTypes.CARD_CREATE_HANDLE,
  payload: {
    card,
    users,
    cardMemberships,
    cardLabels,
    releaseCards,
    boardReleases,
    taskLists,
    tasks,
    attachments,
    customFieldGroups,
    customFields,
    customFieldValues,
  },
});

const updateCard = (id, data) => ({
  type: ActionTypes.CARD_UPDATE,
  payload: {
    id,
    data,
  },
});

updateCard.success = (card) => ({
  type: ActionTypes.CARD_UPDATE__SUCCESS,
  payload: {
    card,
  },
});

updateCard.failure = (id, error) => ({
  type: ActionTypes.CARD_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCardUpdate = (
  card,
  isFetched,
  users,
  cardMemberships,
  cardLabels,
  releaseCards,
  boardReleases,
  taskLists,
  tasks,
  attachments,
  customFieldGroups,
  customFields,
  customFieldValues,
) => ({
  type: ActionTypes.CARD_UPDATE_HANDLE,
  payload: {
    card,
    isFetched,
    users,
    cardMemberships,
    cardLabels,
    releaseCards,
    boardReleases,
    taskLists,
    tasks,
    attachments,
    customFieldGroups,
    customFields,
    customFieldValues,
  },
});

const duplicateCard = (id, localId, data) => ({
  type: ActionTypes.CARD_DUPLICATE,
  payload: {
    id,
    localId,
    data,
  },
});

duplicateCard.success = (
  localId,
  card,
  cardMemberships,
  cardLabels,
  taskLists,
  tasks,
  attachments,
  customFieldGroups,
  customFields,
  customFieldValues,
) => ({
  type: ActionTypes.CARD_DUPLICATE__SUCCESS,
  payload: {
    localId,
    card,
    cardMemberships,
    cardLabels,
    taskLists,
    tasks,
    attachments,
    customFieldGroups,
    customFields,
    customFieldValues,
  },
});

duplicateCard.failure = (localId, error) => ({
  type: ActionTypes.CARD_DUPLICATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const importAndSyncCard = (sourceCardId, targetListId, data) => ({
  type: ActionTypes.CARD_IMPORT_AND_SYNC,
  payload: {
    sourceCardId,
    targetListId,
    data,
  },
});

importAndSyncCard.success = (
  card,
  cardMemberships,
  cardLabels,
  taskLists,
  tasks,
  attachments,
  customFieldGroups,
  customFields,
  customFieldValues,
) => ({
  type: ActionTypes.CARD_IMPORT_AND_SYNC__SUCCESS,
  payload: {
    card,
    cardMemberships,
    cardLabels,
    taskLists,
    tasks,
    attachments,
    customFieldGroups,
    customFields,
    customFieldValues,
  },
});

importAndSyncCard.failure = (error) => ({
  type: ActionTypes.CARD_IMPORT_AND_SYNC__FAILURE,
  payload: {
    error,
  },
});

const deleteCard = (id) => ({
  type: ActionTypes.CARD_DELETE,
  payload: {
    id,
  },
});

deleteCard.success = (card) => ({
  type: ActionTypes.CARD_DELETE__SUCCESS,
  payload: {
    card,
  },
});

deleteCard.failure = (id, error) => ({
  type: ActionTypes.CARD_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCardDelete = (card) => ({
  type: ActionTypes.CARD_DELETE_HANDLE,
  payload: {
    card,
  },
});

const fetchChildCards = (parentId) => ({
  type: ActionTypes.CARD_CHILDREN_FETCH,
  payload: {
    parentId,
  },
});

fetchChildCards.success = (
  parentId,
  cards,
  users,
  cardMemberships,
  cardLabels,
  taskLists,
  tasks,
  attachments,
  customFieldGroups,
  customFields,
  customFieldValues,
) => ({
  type: ActionTypes.CARD_CHILDREN_FETCH__SUCCESS,
  payload: {
    parentId,
    cards,
    users,
    cardMemberships,
    cardLabels,
    taskLists,
    tasks,
    attachments,
    customFieldGroups,
    customFields,
    customFieldValues,
  },
});

fetchChildCards.failure = (parentId, error) => ({
  type: ActionTypes.CARD_CHILDREN_FETCH__FAILURE,
  payload: {
    parentId,
    error,
  },
});

const addDependencyToCard = (cardId, dependsOnCardId) => ({
  type: ActionTypes.CARD_DEPENDENCY_CREATE,
  payload: {
    cardId,
    dependsOnCardId,
  },
});

addDependencyToCard.success = (cardDependency) => ({
  type: ActionTypes.CARD_DEPENDENCY_CREATE__SUCCESS,
  payload: {
    cardDependency,
  },
});

addDependencyToCard.failure = (cardId, dependsOnCardId, error) => ({
  type: ActionTypes.CARD_DEPENDENCY_CREATE__FAILURE,
  payload: {
    cardId,
    dependsOnCardId,
    error,
  },
});

const handleCardDependencyCreate = (cardDependency) => ({
  type: ActionTypes.CARD_DEPENDENCY_CREATE_HANDLE,
  payload: {
    cardDependency,
  },
});

const removeDependencyFromCard = (id, cardId, dependsOnCardId) => ({
  type: ActionTypes.CARD_DEPENDENCY_DELETE,
  payload: {
    id,
    cardId,
    dependsOnCardId,
  },
});

removeDependencyFromCard.success = (cardDependency) => ({
  type: ActionTypes.CARD_DEPENDENCY_DELETE__SUCCESS,
  payload: {
    cardDependency,
  },
});

removeDependencyFromCard.failure = (id, error) => ({
  type: ActionTypes.CARD_DEPENDENCY_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCardDependencyDelete = (cardDependency) => ({
  type: ActionTypes.CARD_DEPENDENCY_DELETE_HANDLE,
  payload: {
    cardDependency,
  },
});

export default {
  fetchCards,
  handleCardsUpdate,
  createCard,
  handleCardCreate,
  updateCard,
  handleCardUpdate,
  duplicateCard,
  importAndSyncCard,
  deleteCard,
  handleCardDelete,
  fetchChildCards,
  addDependencyToCard,
  handleCardDependencyCreate,
  removeDependencyFromCard,
  handleCardDependencyDelete,
};
