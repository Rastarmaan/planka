/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* projectProfilesWatchers() {
  yield all([
    takeEvery(EntryActionTypes.PROJECT_PROFILE_CREATE, ({ payload: { data } }) =>
      services.createProjectProfile(data),
    ),
    takeEvery(
      EntryActionTypes.PROJECT_PROFILE_CREATE_HANDLE,
      ({ payload: { projectProfile, sections, fields } }) =>
        services.handleProjectProfileCreate(projectProfile, sections, fields),
    ),
    takeEvery(EntryActionTypes.PROJECT_PROFILE_UPDATE, ({ payload: { id, data } }) =>
      services.updateProjectProfile(id, data),
    ),
    takeEvery(EntryActionTypes.PROJECT_PROFILE_UPDATE_HANDLE, ({ payload: { projectProfile } }) =>
      services.handleProjectProfileUpdate(projectProfile),
    ),
    takeEvery(EntryActionTypes.PROJECT_PROFILE_DELETE, ({ payload: { id } }) =>
      services.deleteProjectProfile(id),
    ),
    takeEvery(EntryActionTypes.PROJECT_PROFILE_DELETE_HANDLE, ({ payload: { projectProfile } }) =>
      services.handleProjectProfileDelete(projectProfile),
    ),
    takeEvery(
      EntryActionTypes.PROJECT_PROFILE_SECTION_CREATE,
      ({ payload: { profileId, data } }) => {
        return services.createProjectProfileSection(profileId, data);
      },
    ),
    takeEvery(
      EntryActionTypes.PROJECT_PROFILE_SECTION_CREATE_HANDLE,
      ({ payload: { projectProfileSection, fields } }) =>
        services.handleProjectProfileSectionCreate(projectProfileSection, fields),
    ),
    takeEvery(EntryActionTypes.PROJECT_PROFILE_SECTION_UPDATE, ({ payload: { id, data } }) =>
      services.updateProjectProfileSection(id, data),
    ),
    takeEvery(
      EntryActionTypes.PROJECT_PROFILE_SECTION_UPDATE_HANDLE,
      ({ payload: { projectProfileSection } }) =>
        services.handleProjectProfileSectionUpdate(projectProfileSection),
    ),
    takeEvery(EntryActionTypes.PROJECT_PROFILE_SECTION_DELETE, ({ payload: { id } }) =>
      services.deleteProjectProfileSection(id),
    ),
    takeEvery(
      EntryActionTypes.PROJECT_PROFILE_SECTION_DELETE_HANDLE,
      ({ payload: { projectProfileSection } }) =>
        services.handleProjectProfileSectionDelete(projectProfileSection),
    ),
    takeEvery(EntryActionTypes.PROJECT_PROFILE_FIELD_CREATE, ({ payload: { sectionId, data } }) =>
      services.createProjectProfileField(sectionId, data),
    ),
    takeEvery(
      EntryActionTypes.PROJECT_PROFILE_FIELD_CREATE_HANDLE,
      ({ payload: { projectProfileField } }) =>
        services.handleProjectProfileFieldCreate(projectProfileField),
    ),
    takeEvery(EntryActionTypes.PROJECT_PROFILE_FIELD_UPDATE, ({ payload: { id, data } }) =>
      services.updateProjectProfileField(id, data),
    ),
    takeEvery(
      EntryActionTypes.PROJECT_PROFILE_FIELD_UPDATE_HANDLE,
      ({ payload: { projectProfileField } }) =>
        services.handleProjectProfileFieldUpdate(projectProfileField),
    ),
    takeEvery(EntryActionTypes.PROJECT_PROFILE_FIELD_DELETE, ({ payload: { id } }) =>
      services.deleteProjectProfileField(id),
    ),
    takeEvery(
      EntryActionTypes.PROJECT_PROFILE_FIELD_DELETE_HANDLE,
      ({ payload: { projectProfileField } }) =>
        services.handleProjectProfileFieldDelete(projectProfileField),
    ),
    takeEvery(EntryActionTypes.PROJECT_PROFILE_DATA_LOAD, ({ payload: { projectId } }) =>
      services.loadProjectProfileData(projectId),
    ),
    takeEvery(EntryActionTypes.PROJECT_PROFILE_DATA_LOAD_HANDLE, ({ payload: { data } }) =>
      services.handleProjectProfileDataLoad(data),
    ),
    takeEvery(
      EntryActionTypes.PROJECT_PROFILE_DATA_SAVE,
      ({ payload: { projectId, profileId, fieldValues } }) =>
        services.saveProjectProfileData(projectId, profileId, fieldValues),
    ),
    takeEvery(EntryActionTypes.PROJECT_PROFILE_DATA_SAVE_HANDLE, ({ payload: { data } }) =>
      services.handleProjectProfileDataSave(data),
    ),
  ]);
}
