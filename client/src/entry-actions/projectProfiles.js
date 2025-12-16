/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

/* Project Profiles */

const createProjectProfile = (data) => ({
  type: EntryActionTypes.PROJECT_PROFILE_CREATE,
  payload: {
    data,
  },
});

const handleProjectProfileCreate = (projectProfile, sections, fields) => ({
  type: EntryActionTypes.PROJECT_PROFILE_CREATE_HANDLE,
  payload: {
    projectProfile,
    sections,
    fields,
  },
});

const updateProjectProfile = (id, data) => ({
  type: EntryActionTypes.PROJECT_PROFILE_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleProjectProfileUpdate = (projectProfile) => ({
  type: EntryActionTypes.PROJECT_PROFILE_UPDATE_HANDLE,
  payload: {
    projectProfile,
  },
});

const deleteProjectProfile = (id) => ({
  type: EntryActionTypes.PROJECT_PROFILE_DELETE,
  payload: {
    id,
  },
});

const handleProjectProfileDelete = (projectProfile) => ({
  type: EntryActionTypes.PROJECT_PROFILE_DELETE_HANDLE,
  payload: {
    projectProfile,
  },
});

/* Project Profile Sections */

const createProjectProfileSection = (profileId, data) => ({
  type: EntryActionTypes.PROJECT_PROFILE_SECTION_CREATE,
  payload: {
    profileId,
    data,
  },
});

const handleProjectProfileSectionCreate = (projectProfileSection, fields) => ({
  type: EntryActionTypes.PROJECT_PROFILE_SECTION_CREATE_HANDLE,
  payload: {
    projectProfileSection,
    fields,
  },
});

const updateProjectProfileSection = (id, data) => ({
  type: EntryActionTypes.PROJECT_PROFILE_SECTION_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleProjectProfileSectionUpdate = (projectProfileSection) => ({
  type: EntryActionTypes.PROJECT_PROFILE_SECTION_UPDATE_HANDLE,
  payload: {
    projectProfileSection,
  },
});

const deleteProjectProfileSection = (id) => ({
  type: EntryActionTypes.PROJECT_PROFILE_SECTION_DELETE,
  payload: {
    id,
  },
});

const handleProjectProfileSectionDelete = (projectProfileSection) => ({
  type: EntryActionTypes.PROJECT_PROFILE_SECTION_DELETE_HANDLE,
  payload: {
    projectProfileSection,
  },
});

/* Project Profile Fields */

const createProjectProfileField = (sectionId, data) => ({
  type: EntryActionTypes.PROJECT_PROFILE_FIELD_CREATE,
  payload: {
    sectionId,
    data,
  },
});

const handleProjectProfileFieldCreate = (projectProfileField) => ({
  type: EntryActionTypes.PROJECT_PROFILE_FIELD_CREATE_HANDLE,
  payload: {
    projectProfileField,
  },
});

const updateProjectProfileField = (id, data) => ({
  type: EntryActionTypes.PROJECT_PROFILE_FIELD_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleProjectProfileFieldUpdate = (projectProfileField) => ({
  type: EntryActionTypes.PROJECT_PROFILE_FIELD_UPDATE_HANDLE,
  payload: {
    projectProfileField,
  },
});

const deleteProjectProfileField = (id) => ({
  type: EntryActionTypes.PROJECT_PROFILE_FIELD_DELETE,
  payload: {
    id,
  },
});

const handleProjectProfileFieldDelete = (projectProfileField) => ({
  type: EntryActionTypes.PROJECT_PROFILE_FIELD_DELETE_HANDLE,
  payload: {
    projectProfileField,
  },
});

/* Project Profile Data */

const loadProjectProfileData = (projectId) => ({
  type: EntryActionTypes.PROJECT_PROFILE_DATA_LOAD,
  payload: {
    projectId,
  },
});

const handleProjectProfileDataLoad = (data) => ({
  type: EntryActionTypes.PROJECT_PROFILE_DATA_LOAD_HANDLE,
  payload: {
    data,
  },
});

const saveProjectProfileData = (projectId, profileId, fieldValues) => ({
  type: EntryActionTypes.PROJECT_PROFILE_DATA_SAVE,
  payload: {
    projectId,
    profileId,
    fieldValues,
  },
});

const handleProjectProfileDataSave = (data) => ({
  type: EntryActionTypes.PROJECT_PROFILE_DATA_SAVE_HANDLE,
  payload: {
    data,
  },
});

export default {
  createProjectProfile,
  handleProjectProfileCreate,
  updateProjectProfile,
  handleProjectProfileUpdate,
  deleteProjectProfile,
  handleProjectProfileDelete,
  createProjectProfileSection,
  handleProjectProfileSectionCreate,
  updateProjectProfileSection,
  handleProjectProfileSectionUpdate,
  deleteProjectProfileSection,
  handleProjectProfileSectionDelete,
  createProjectProfileField,
  handleProjectProfileFieldCreate,
  updateProjectProfileField,
  handleProjectProfileFieldUpdate,
  deleteProjectProfileField,
  handleProjectProfileFieldDelete,
  loadProjectProfileData,
  handleProjectProfileDataLoad,
  saveProjectProfileData,
  handleProjectProfileDataSave,
};
