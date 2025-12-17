/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, fork, put, select, take } from 'redux-saga/effects';
import { push } from '../../../lib/redux-router';

import actions from '../../../actions';
import api from '../../../api';
import ActionTypes from '../../../constants/ActionTypes';
import Paths from '../../../constants/Paths';
import selectors from '../../../selectors';
import { getAccessToken } from '../../../utils/access-token-storage';
import mergeRecords from '../../../utils/merge-records';
import request from '../request';
import { logout } from './core';

export function* goTo(pathname) {
  yield put(push(pathname));
}

export function* goToRoot() {
  yield call(goTo, Paths.ROOT);
}

export function* goToProject(projectId) {
  yield call(goTo, Paths.PROJECTS.replace(':id', projectId));
}

export function* goToBoard(boardId) {
  yield call(goTo, Paths.BOARDS.replace(':id', boardId));
}

export function* goToCard(cardId) {
  yield call(goTo, Paths.CARDS.replace(':id', cardId));
}

export function* handleLocationChange() {
  const accessToken = yield call(getAccessToken);

  if (!accessToken) {
    yield call(logout, false);
    return;
  }

  const pathsMatch = yield select(selectors.selectPathsMatch);

  if (!pathsMatch) {
    return;
  }

  switch (pathsMatch.pattern.path) {
    case Paths.LOGIN:
    case Paths.OIDC_CALLBACK:
      yield call(goToRoot);

      break;
    default:
  }

  const isInitializing = yield select(selectors.selectIsInitializing);

  if (isInitializing) {
    yield take(ActionTypes.CORE_INITIALIZE);
  }

  let currentBoard = yield select(selectors.selectCurrentBoard);

  let currentBoardId = null;
  let currentCardId = null;
  let isEditModeEnabled;
  let board;
  let card;
  let users1;
  let users2;
  let projects;
  let boardMemberships;
  let labels;
  let lists;
  let cards;
  let cardMemberships1;
  let cardMemberships2;
  let cardLabels1;
  let cardLabels2;
  let cardDependencies1;
  let cardDependencies2;
  let taskLists1;
  let taskLists2;
  let tasks1;
  let tasks2;
  let attachments1;
  let attachments2;
  let customFieldGroups1;
  let customFieldGroups2;
  let customFields1;
  let customFields2;
  let customFieldValues1;
  let customFieldValues2;
  let notificationsToDelete;

  switch (pathsMatch.pattern.path) {
    case Paths.ROOT:
      isEditModeEnabled = false;

      break;
    case Paths.PROJECTS: {
      const boardIds = yield select(selectors.selectBoardIdsForCurrentProject);

      if (boardIds && boardIds.length === 0) {
        isEditModeEnabled = true;
      } else if (boardIds && boardIds.length > 0) {
        yield call(goToBoard, boardIds[0]);
        return;
      }

      break;
    }
    case Paths.PROJECT_STATS:
      isEditModeEnabled = false;

      break;
    case Paths.BOARDS:
      if (currentBoard) {
        ({ id: currentBoardId } = currentBoard);

        if (currentBoard.isFetching === null) {
          yield put(actions.handleLocationChange.fetchBoard(currentBoard.id));

          try {
            ({
              item: board,
              included: {
                projects,
                boardMemberships,
                labels,
                lists,
                cards,
                users: users1,
                cardMemberships: cardMemberships1,
                cardLabels: cardLabels1,
                cardDependencies: cardDependencies1,
                taskLists: taskLists1,
                tasks: tasks1,
                attachments: attachments1,
                customFieldGroups: customFieldGroups1,
                customFields: customFields1,
                cardDependencies: cardDependencies1,
              },
            } = yield call(request, api.getBoard, currentBoard.id, true));
          } catch {
            /* empty */
          }
        }
      }

      break;
    case Paths.CARDS: {
      ({ cardId: currentCardId, boardId: currentBoardId } = yield select(selectors.selectPath));

      yield put(actions.handleLocationChange.fetchContent());

      const existingCard = yield select(selectors.selectCardById, pathsMatch.params.id);

      if (existingCard) {
        card = existingCard;
        yield put(
          actions.handleLocationChange(
            pathsMatch.pathname,
            existingCard.boardId,
            existingCard.id,
            isEditModeEnabled,
            null,
            null,
            null,
            null,
            null,
            null,
            [existingCard],
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
          ),
        );

        yield fork(function* fetchFreshCardData() {
          try {
            ({
              item: card,
              included: {
                users: users1,
                cardMemberships: cardMemberships1,
                cardLabels: cardLabels1,
                cardDependencies: cardDependencies1,
                taskLists: taskLists1,
                tasks: tasks1,
                attachments: attachments1,
                customFieldGroups: customFieldGroups1,
                customFields: customFields1,
                customFieldValues: customFieldValues1,
              },
            } = yield call(request, api.getCard, pathsMatch.params.id));

            const mergedCardDependencies = mergeRecords(cardDependencies1);
            yield put(
              actions.handleLocationChange(
                pathsMatch.pathname,
                existingCard.boardId,
                card.id,
                isEditModeEnabled,
                null,
                users1,
                null,
                null,
                null,
                null,
                [card],
                cardMemberships1,
                cardLabels1,
                mergedCardDependencies,
                taskLists1,
                tasks1,
                attachments1,
                customFieldGroups1,
                customFields1,
                customFieldValues1,
                null,
              ),
            );
          } catch {
            /* empty */
          }
        });
      } else {
        try {
          ({
            item: card,
            included: {
              users: users1,
              cardMemberships: cardMemberships1,
              cardLabels: cardLabels1,
              cardDependencies: cardDependencies1,
              taskLists: taskLists1,
              tasks: tasks1,
              attachments: attachments1,
              customFieldGroups: customFieldGroups1,
              customFields: customFields1,
              customFieldValues: customFieldValues1,
            },
          } = yield call(request, api.getCard, pathsMatch.params.id));
        } catch {
          /* empty */
        }
      }

      if (card) {
        ({ id: currentCardId } = card);

        // Performance optimization: Dispatch card data immediately for instant UI update
        const mergedCardDependencies = mergeRecords(cardDependencies1);
        yield put(
          actions.handleLocationChange(
            pathsMatch.pathname,
            null, // boardId will be set by background fetch
            currentCardId,
            isEditModeEnabled,
            null, // board will be loaded in background
            users1,
            null, // projects from board
            null, // boardMemberships from board
            null, // labels from board
            null, // lists from board
            [card], // card data available immediately
            cardMemberships1,
            cardLabels1,
            mergedCardDependencies,
            taskLists1,
            tasks1,
            attachments1,
            customFieldGroups1,
            customFields1,
            customFieldValues1,
            null, // notifications
          ),
        );

        currentBoard = yield select(selectors.selectBoardById, card.boardId);

        if (currentBoard) {
          ({ id: currentBoardId } = currentBoard);

          // Fetch board and notifications in parallel (non-blocking)
          if (currentBoard.isFetching === null) {
            yield fork(function* fetchBoardInBackground() {
              try {
                ({
                  item: board,
                  included: {
                    projects,
                    boardMemberships,
                    labels,
                    lists,
                    cards,
                    users: users2,
                    cardMemberships: cardMemberships2,
                    cardLabels: cardLabels2,
                    cardDependencies: cardDependencies2,
                    taskLists: taskLists2,
                    tasks: tasks2,
                    attachments: attachments2,
                    customFieldGroups: customFieldGroups2,
                    customFields: customFields2,
                    customFieldValues: customFieldValues2,
                  },
                } = yield call(request, api.getBoard, card.boardId, true));

                // Update with board data when available
                const mergedBoardCardDependencies = mergeRecords(
                  cardDependencies1,
                  cardDependencies2,
                );
                yield put(
                  actions.handleLocationChange(
                    pathsMatch.pathname,
                    currentBoardId,
                    currentCardId,
                    isEditModeEnabled,
                    board,
                    mergeRecords(users1, users2),
                    projects,
                    boardMemberships,
                    labels,
                    lists,
                    mergeRecords([card], cards),
                    mergeRecords(cardMemberships1, cardMemberships2),
                    mergeRecords(cardLabels1, cardLabels2),
                    mergedBoardCardDependencies,
                    mergeRecords(taskLists1, taskLists2),
                    mergeRecords(tasks1, tasks2),
                    mergeRecords(attachments1, attachments2),
                    mergeRecords(customFieldGroups1, customFieldGroups2),
                    mergeRecords(customFields1, customFields2),
                    mergeRecords(customFieldValues1, customFieldValues2),
                    null,
                  ),
                );
              } catch {
                /* empty */
              }
            });
          }
        }

        // Read notifications in parallel (non-blocking)
        if (currentCardId) {
          yield fork(function* readNotificationsInBackground() {
            const notificationIds = yield select(
              selectors.selectNotificationIdsByCardId,
              currentCardId,
            );

            if (notificationIds.length > 0) {
              try {
                yield call(request, api.readCardNotifications, currentCardId);
              } catch {
                /* empty */
              }
            }
          });
        }
      }

      break;
    }
    default:
  }

  // Skip final dispatch for CARDS path - already dispatched immediately for instant UI
  if (pathsMatch.path !== Paths.CARDS) {
    const mergedCardDependencies = mergeRecords(cardDependencies1, cardDependencies2);

    yield put(
      actions.handleLocationChange(
        pathsMatch.pathname,
        currentBoardId,
        currentCardId,
        isEditModeEnabled,
        board,
        mergeRecords(users1, users2),
        projects,
        boardMemberships,
        labels,
        lists,
        mergeRecords(card && [card], cards),
        mergeRecords(cardMemberships1, cardMemberships2),
        mergeRecords(cardLabels1, cardLabels2),
        mergedCardDependencies,
        mergeRecords(taskLists1, taskLists2),
        mergeRecords(tasks1, tasks2),
        mergeRecords(attachments1, attachments2),
        mergeRecords(customFieldGroups1, customFieldGroups2),
        mergeRecords(customFields1, customFields2),
        mergeRecords(customFieldValues1, customFieldValues2),
        notificationsToDelete,
      ),
    );
  }
}

export default {
  goTo,
  goToRoot,
  goToProject,
  goToBoard,
  goToCard,
  handleLocationChange,
};
