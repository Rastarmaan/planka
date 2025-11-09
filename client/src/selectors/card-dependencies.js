/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectDependenciesByCardId = () =>
  createSelector(
    orm,
    (_, cardId) => cardId,
    ({ CardDependency }, cardId) => {
      if (!cardId) {
        return [];
      }

      return CardDependency.filter({ cardId }).toRefArray();
    },
  );

export const selectDependenciesByCardId = makeSelectDependenciesByCardId();

export const makeSelectDependsOnCardIdsByCardId = () =>
  createSelector(
    orm,
    (_, cardId) => cardId,
    ({ CardDependency }, cardId) => {
      if (!cardId) {
        return [];
      }

      return CardDependency.filter({ cardId })
        .toRefArray()
        .map((dep) => dep.dependsOnCardId);
    },
  );

export const selectDependsOnCardIdsByCardId = makeSelectDependsOnCardIdsByCardId();

export const makeSelectDependsOnCardsByCardId = () =>
  createSelector(
    orm,
    (_, cardId) => cardId,
    ({ Card, CardDependency }, cardId) => {
      if (!cardId) {
        return [];
      }

      const dependencyRecords = CardDependency.filter({ cardId }).toModelArray();

      return dependencyRecords
        .map((dep) => {
          const dependsOnCard = Card.withId(dep.dependsOnCardId);
          return dependsOnCard ? dependsOnCard.ref : null;
        })
        .filter(Boolean);
    },
  );

export const selectDependsOnCardsByCardId = makeSelectDependsOnCardsByCardId();

export const makeSelectDependentsByCardId = () =>
  createSelector(
    orm,
    (_, cardId) => cardId,
    ({ CardDependency }, cardId) => {
      if (!cardId) {
        return [];
      }

      return CardDependency.filter({ dependsOnCardId: cardId }).toRefArray();
    },
  );

export const selectDependentsByCardId = makeSelectDependentsByCardId();

export const makeSelectDependentCardIdsByCardId = () =>
  createSelector(
    orm,
    (_, cardId) => cardId,
    ({ CardDependency }, cardId) => {
      if (!cardId) {
        return [];
      }

      return CardDependency.filter({ dependsOnCardId: cardId })
        .toRefArray()
        .map((dep) => dep.cardId);
    },
  );

export const selectDependentCardIdsByCardId = makeSelectDependentCardIdsByCardId();

export const makeSelectDependentCardsByCardId = () =>
  createSelector(
    orm,
    (_, cardId) => cardId,
    ({ Card, CardDependency }, cardId) => {
      if (!cardId) {
        return [];
      }

      const dependentRecords = CardDependency.filter({ dependsOnCardId: cardId }).toModelArray();

      return dependentRecords
        .map((dep) => {
          const dependentCard = Card.withId(dep.cardId);
          return dependentCard ? dependentCard.ref : null;
        })
        .filter(Boolean);
    },
  );

export const selectDependentCardsByCardId = makeSelectDependentCardsByCardId();

export const makeSelectIsCardBlocked = () =>
  createSelector(
    orm,
    (_, cardId) => cardId,
    ({ Card, CardDependency }, cardId) => {
      if (!cardId) {
        return false;
      }

      const dependencyRecords = CardDependency.filter({ cardId }).toModelArray();

      if (dependencyRecords.length === 0) {
        return false;
      }

      return dependencyRecords.some((dep) => {
        const dependsOnCard = Card.withId(dep.dependsOnCardId);
        return dependsOnCard && !dependsOnCard.isClosed;
      });
    },
  );

export const selectIsCardBlocked = makeSelectIsCardBlocked();

export const makeSelectDependencyCountByCardId = () =>
  createSelector(
    orm,
    (_, cardId) => cardId,
    ({ CardDependency }, cardId) => {
      if (!cardId) {
        return 0;
      }

      return CardDependency.filter({ cardId }).count();
    },
  );

export const selectDependencyCountByCardId = makeSelectDependencyCountByCardId();

export const makeSelectDependentCountByCardId = () =>
  createSelector(
    orm,
    (_, cardId) => cardId,
    ({ CardDependency }, cardId) => {
      if (!cardId) {
        return 0;
      }

      return CardDependency.filter({ dependsOnCardId: cardId }).count();
    },
  );

export const selectDependentCountByCardId = makeSelectDependentCountByCardId();

export const selectDependenciesForCurrentCard = createSelector(
  orm,
  (state) => state.router.location.pathname,
  ({ CardDependency }, pathname) => {
    const match = pathname.match(/\/cards\/([^/]+)/);
    if (!match) {
      return [];
    }

    const cardId = match[1];
    return CardDependency.filter({ cardId }).toRefArray();
  },
);

export const selectDependsOnCardsForCurrentCard = createSelector(
  orm,
  (state) => state.router.location.pathname,
  ({ Card, CardDependency }, pathname) => {
    const match = pathname.match(/\/cards\/([^/]+)/);
    if (!match) {
      return [];
    }

    const cardId = match[1];
    const dependencyRecords = CardDependency.filter({ cardId }).toModelArray();

    return dependencyRecords
      .map((dep) => {
        const dependsOnCard = Card.withId(dep.dependsOnCardId);
        return dependsOnCard ? dependsOnCard.ref : null;
      })
      .filter(Boolean);
  },
);

export const selectDependentCardsForCurrentCard = createSelector(
  orm,
  (state) => state.router.location.pathname,
  ({ Card, CardDependency }, pathname) => {
    const match = pathname.match(/\/cards\/([^/]+)/);
    if (!match) {
      return [];
    }

    const cardId = match[1];
    const dependentRecords = CardDependency.filter({ dependsOnCardId: cardId }).toModelArray();

    return dependentRecords
      .map((dep) => {
        const dependentCard = Card.withId(dep.cardId);
        return dependentCard ? dependentCard.ref : null;
      })
      .filter(Boolean);
  },
);

export default {
  makeSelectDependenciesByCardId,
  selectDependenciesByCardId,
  makeSelectDependsOnCardIdsByCardId,
  selectDependsOnCardIdsByCardId,
  makeSelectDependsOnCardsByCardId,
  selectDependsOnCardsByCardId,
  makeSelectDependentsByCardId,
  selectDependentsByCardId,
  makeSelectDependentCardIdsByCardId,
  selectDependentCardIdsByCardId,
  makeSelectDependentCardsByCardId,
  selectDependentCardsByCardId,
  makeSelectIsCardBlocked,
  selectIsCardBlocked,
  makeSelectDependencyCountByCardId,
  selectDependencyCountByCardId,
  makeSelectDependentCountByCardId,
  selectDependentCountByCardId,
  selectDependenciesForCurrentCard,
  selectDependsOnCardsForCurrentCard,
  selectDependentCardsForCurrentCard,
};
