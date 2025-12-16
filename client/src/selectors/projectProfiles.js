/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';

export const selectAllProjectProfiles = createSelector(orm, (session) => {
  const profiles = session.ProjectProfile.all().toRefArray();
  return profiles;
});

export const selectProjectProfileById = createSelector(
  orm,
  (_, id) => id,
  (session, id) => {
    const projectProfile = session.ProjectProfile.withId(id);

    if (!projectProfile) {
      return projectProfile;
    }

    return projectProfile.ref;
  },
);

export const selectAllProjectProfileSections = createSelector(orm, (session) => {
  return session.ProjectProfileSection.all().toRefArray();
});

export const selectProjectProfileSectionById = createSelector(
  orm,
  (_, id) => id,
  (session, id) => {
    const section = session.ProjectProfileSection.withId(id);

    if (!section) {
      return section;
    }

    return section.ref;
  },
);

export const selectSectionsByProfileId = createSelector(
  orm,
  (_, profileId) => profileId,
  (session, profileId) => {
    return session.ProjectProfileSection.all()
      .filter((section) => section.profileId === profileId)
      .orderBy('position')
      .toModelArray();
  },
);

export const selectAllProjectProfileFields = createSelector(orm, (session) => {
  return session.ProjectProfileField.all().toRefArray();
});

export const selectProjectProfileFieldById = createSelector(
  orm,
  (_, id) => id,
  (session, id) => {
    const field = session.ProjectProfileField.withId(id);

    if (!field) {
      return field;
    }

    return field.ref;
  },
);

export const selectFieldsBySectionId = createSelector(
  orm,
  (_, sectionId) => sectionId,
  (session, sectionId) => {
    return session.ProjectProfileField.all()
      .filter((field) => field.sectionId === sectionId)
      .orderBy('position')
      .toModelArray();
  },
);

export const selectProjectProfileDataByProjectId = createSelector(
  orm,
  (_, projectId) => projectId,
  (session, projectId) => {
    return session.ProjectProfileData.filter((data) => data.projectId === projectId).toRefArray();
  },
);

export const selectAllProjectProfileData = createSelector(orm, (session) => {
  return session.ProjectProfileData.all().toRefArray();
});

export const selectProjectsWithProfileData = createSelector(orm, (session) => {
  const allData = session.ProjectProfileData.all().toRefArray();

  const uniqueCombinations = new Map();

  allData.forEach((data) => {
    const key = `${data.projectId}-${data.profileId}`;
    if (!uniqueCombinations.has(key)) {
      uniqueCombinations.set(key, {
        projectId: data.projectId,
        profileId: data.profileId,
        createdAt: data.createdAt,
      });
    }
  });

  return Array.from(uniqueCombinations.values());
});

export default {
  selectAllProjectProfiles,
  selectProjectProfileById,
  selectAllProjectProfileSections,
  selectProjectProfileSectionById,
  selectSectionsByProfileId,
  selectAllProjectProfileFields,
  selectProjectProfileFieldById,
  selectFieldsBySectionId,
  selectProjectProfileDataByProjectId,
  selectAllProjectProfileData,
  selectProjectsWithProfileData,
};
