/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectLinkedBoardsByBoardId = () =>
  createSelector(
    orm,
    (_, boardId) => boardId,
    ({ BoardLink }, boardId) => {
      const links = BoardLink.all()
        .filter((link) => link.sourceBoardId === boardId || link.linkedBoardId === boardId)
        .toRefArray();

      return links.map((link) => ({
        ...link,
        isSource: link.sourceBoardId === boardId,
        relatedBoardId: link.sourceBoardId === boardId ? link.linkedBoardId : link.sourceBoardId,
      }));
    },
  );

export const makeSelectBoardLinkById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ BoardLink }, id) => {
      const link = BoardLink.withId(id);
      return link ? link.ref : null;
    },
  );

export const selectAllBoardLinks = createSelector(orm, ({ BoardLink }) =>
  BoardLink.all().toRefArray(),
);

export default {
  makeSelectLinkedBoardsByBoardId,
  makeSelectBoardLinkById,
  selectAllBoardLinks,
};
