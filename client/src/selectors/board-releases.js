import { createSelector } from 'redux-orm';

import { selectPath } from './router';
import orm from '../orm';

export const makeSelectBoardReleasesByBoardId = () =>
  createSelector(
    orm,
    (_, boardId) => boardId,
    ({ Board }, boardId) => {
      const board = Board.withId(boardId);
      return board ? board.releases.toRefArray() : [];
    },
  );

export const selectBoardReleasesByBoardId = makeSelectBoardReleasesByBoardId();

export const selectBoardReleasesForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, boardId) => {
    if (!boardId) {
      return [];
    }

    const board = Board.withId(boardId);
    if (!board) {
      return [];
    }

    return board.releases
      .toRefArray()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
);

export const selectActiveBoardReleasesForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, boardId) => {
    if (!boardId) {
      return [];
    }

    const board = Board.withId(boardId);
    if (!board) {
      return [];
    }

    const releases = board.releases
      .toRefArray()
      .filter((release) => release.status !== 'released' && release.status !== 'cancelled')
      .sort((a, b) => a.version.localeCompare(b.version));

    return releases;
  },
);

export const makeSelectBoardReleaseById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ BoardRelease }, id) => {
      const boardReleaseModel = BoardRelease.withId(id);
      if (!boardReleaseModel) {
        return boardReleaseModel;
      }
      return boardReleaseModel.ref;
    },
  );

export const selectBoardReleaseById = makeSelectBoardReleaseById();

export const selectReleaseCardsForRelease = createSelector(
  orm,
  (_, releaseId) => releaseId,
  ({ BoardRelease }, releaseId) => {
    const release = BoardRelease.withId(releaseId);
    if (!release) {
      return [];
    }
    return release.cards.toRefArray();
  },
);

export const makeSelectReleasesForCard = () =>
  createSelector(
    orm,
    (_, cardId) => cardId,
    ({ Card }, cardId) => {
      const card = Card.withId(cardId);
      if (!card) {
        return [];
      }
      return card.releaseCards
        .toModelArray()
        .map((releaseCard) => releaseCard.release.ref)
        .filter(Boolean);
    },
  );

export const selectReleasesForCard = makeSelectReleasesForCard();

export const selectReleaseCardCounts = createSelector(orm, ({ ReleaseCard, Card }) => {
  const releaseCards = ReleaseCard.all().toRefArray();

  const counts = releaseCards.reduce((acc, rc) => {
    const card = Card.withId(rc.cardId);

    if (!card) {
      return acc;
    }

    const parentInSameRelease =
      card.parentCardId &&
      releaseCards.some((r) => r.releaseId === rc.releaseId && r.cardId === card.parentCardId);

    if (!parentInSameRelease) {
      acc[rc.releaseId] = (acc[rc.releaseId] || 0) + 1;
    }

    return acc;
  }, {});

  return counts;
});

export const selectCardIdsInReleases = createSelector(orm, ({ ReleaseCard }) => {
  const releaseCards = ReleaseCard.all().toRefArray();
  return releaseCards.map((rc) => rc.cardId);
});

export const selectReleasedReleaseIds = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, boardId) => {
    if (!boardId) {
      return [];
    }

    const board = Board.withId(boardId);
    if (!board) {
      return [];
    }

    return board.releases
      .toRefArray()
      .filter((release) => release.status === 'released')
      .map((release) => release.id);
  },
);

export default {
  makeSelectBoardReleasesByBoardId,
  selectBoardReleasesByBoardId,
  selectBoardReleasesForCurrentBoard,
  selectActiveBoardReleasesForCurrentBoard,
  makeSelectBoardReleaseById,
  selectBoardReleaseById,
  selectReleaseCardsForRelease,
  makeSelectReleasesForCard,
  selectReleasesForCard,
  selectReleaseCardCounts,
  selectCardIdsInReleases,
  selectReleasedReleaseIds,
};
