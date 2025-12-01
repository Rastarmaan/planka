/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector as createReselectSelector } from 'reselect';

const selectShareLinks = (state) => state.orm.ShareLink;

export const makeSelectShareLinksByResource = () =>
  createReselectSelector(
    [selectShareLinks, (_, resourceType, resourceId) => ({ resourceType, resourceId })],
    (shareLinks, { resourceType, resourceId }) =>
      shareLinks
        .all()
        .filter(
          (link) =>
            link.resourceType === resourceType && link.resourceId === resourceId && link.isActive,
        )
        .toRefArray()
        .sort((a, b) => b.createdAt - a.createdAt),
  );

export const makeSelectShareLinkById = () =>
  createReselectSelector([selectShareLinks, (_, id) => id], (shareLinks, id) => {
    const shareLink = shareLinks.withId(id);
    return shareLink ? shareLink.ref : null;
  });

export const makeSelectActiveShareLinksCount = () =>
  createReselectSelector(
    [selectShareLinks, (_, resourceType, resourceId) => ({ resourceType, resourceId })],
    (shareLinks, { resourceType, resourceId }) => {
      const links = shareLinks
        .all()
        .filter(
          (link) =>
            link.resourceType === resourceType && link.resourceId === resourceId && link.isActive,
        );
      return links.count();
    },
  );

export default {
  makeSelectShareLinksByResource,
  makeSelectShareLinkById,
  makeSelectActiveShareLinksCount,
};
