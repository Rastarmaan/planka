/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

/* Project Profiles */

const createProjectProfile = (projectProfile) => ({
  type: ActionTypes.PROJECT_PROFILE_CREATE,
  payload: {
    projectProfile,
  },
});

createProjectProfile.success = (localId, projectProfile, sections, fields) => ({
  type: ActionTypes.PROJECT_PROFILE_CREATE__SUCCESS,
  payload: {
    localId,
    projectProfile,
    projectProfileSections: sections,
    projectProfileFields: fields,
  },
});

createProjectProfile.failure = (localId, error) => ({
  type: ActionTypes.PROJECT_PROFILE_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleProjectProfileCreate = (projectProfile, sections, fields) => ({
  type: ActionTypes.PROJECT_PROFILE_CREATE_HANDLE,
  payload: {
    projectProfile,
    projectProfileSections: sections,
    projectProfileFields: fields,
  },
});

const updateProjectProfile = (id, data) => ({
  type: ActionTypes.PROJECT_PROFILE_UPDATE,
  payload: {
    id,
    data,
  },
});

updateProjectProfile.success = (projectProfile) => ({
  type: ActionTypes.PROJECT_PROFILE_UPDATE__SUCCESS,
  payload: {
    projectProfile,
  },
});

updateProjectProfile.failure = (id, error) => ({
  type: ActionTypes.PROJECT_PROFILE_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectProfileUpdate = (projectProfile) => ({
  type: ActionTypes.PROJECT_PROFILE_UPDATE_HANDLE,
  payload: {
    projectProfile,
  },
});

const deleteProjectProfile = (id) => ({
  type: ActionTypes.PROJECT_PROFILE_DELETE,
  payload: {
    id,
  },
});

deleteProjectProfile.success = (projectProfile) => ({
  type: ActionTypes.PROJECT_PROFILE_DELETE__SUCCESS,
  payload: {
    projectProfile,
  },
});

deleteProjectProfile.failure = (id, error) => ({
  type: ActionTypes.PROJECT_PROFILE_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectProfileDelete = (projectProfile) => ({
  type: ActionTypes.PROJECT_PROFILE_DELETE_HANDLE,
  payload: {
    projectProfile,
  },
});

/* Project Profile Sections */

const createProjectProfileSection = (projectProfileSection) => ({
  type: ActionTypes.PROJECT_PROFILE_SECTION_CREATE,
  payload: {
    projectProfileSection,
  },
});

createProjectProfileSection.success = (localId, projectProfileSection, fields) => ({
  type: ActionTypes.PROJECT_PROFILE_SECTION_CREATE__SUCCESS,
  payload: {
    localId,
    projectProfileSection,
    projectProfileFields: fields,
  },
});

createProjectProfileSection.failure = (localId, error) => ({
  type: ActionTypes.PROJECT_PROFILE_SECTION_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleProjectProfileSectionCreate = (projectProfileSection, fields) => ({
  type: ActionTypes.PROJECT_PROFILE_SECTION_CREATE_HANDLE,
  payload: {
    projectProfileSection,
    projectProfileFields: fields,
  },
});

const updateProjectProfileSection = (id, data) => ({
  type: ActionTypes.PROJECT_PROFILE_SECTION_UPDATE,
  payload: {
    id,
    data,
  },
});

updateProjectProfileSection.success = (projectProfileSection) => ({
  type: ActionTypes.PROJECT_PROFILE_SECTION_UPDATE__SUCCESS,
  payload: {
    projectProfileSection,
  },
});

updateProjectProfileSection.failure = (id, error) => ({
  type: ActionTypes.PROJECT_PROFILE_SECTION_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectProfileSectionUpdate = (projectProfileSection) => ({
  type: ActionTypes.PROJECT_PROFILE_SECTION_UPDATE_HANDLE,
  payload: {
    projectProfileSection,
  },
});

const deleteProjectProfileSection = (id) => ({
  type: ActionTypes.PROJECT_PROFILE_SECTION_DELETE,
  payload: {
    id,
  },
});

deleteProjectProfileSection.success = (projectProfileSection) => ({
  type: ActionTypes.PROJECT_PROFILE_SECTION_DELETE__SUCCESS,
  payload: {
    projectProfileSection,
  },
});

deleteProjectProfileSection.failure = (id, error) => ({
  type: ActionTypes.PROJECT_PROFILE_SECTION_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectProfileSectionDelete = (projectProfileSection) => ({
  type: ActionTypes.PROJECT_PROFILE_SECTION_DELETE_HANDLE,
  payload: {
    projectProfileSection,
  },
});

/* Project Profile Fields */

const createProjectProfileField = (projectProfileField) => ({
  type: ActionTypes.PROJECT_PROFILE_FIELD_CREATE,
  payload: {
    projectProfileField,
  },
});

createProjectProfileField.success = (localId, projectProfileField) => ({
  type: ActionTypes.PROJECT_PROFILE_FIELD_CREATE__SUCCESS,
  payload: {
    localId,
    projectProfileField,
  },
});

createProjectProfileField.failure = (localId, error) => ({
  type: ActionTypes.PROJECT_PROFILE_FIELD_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleProjectProfileFieldCreate = (projectProfileField) => ({
  type: ActionTypes.PROJECT_PROFILE_FIELD_CREATE_HANDLE,
  payload: {
    projectProfileField,
  },
});

const updateProjectProfileField = (id, data) => ({
  type: ActionTypes.PROJECT_PROFILE_FIELD_UPDATE,
  payload: {
    id,
    data,
  },
});

updateProjectProfileField.success = (projectProfileField) => ({
  type: ActionTypes.PROJECT_PROFILE_FIELD_UPDATE__SUCCESS,
  payload: {
    projectProfileField,
  },
});

updateProjectProfileField.failure = (id, error) => ({
  type: ActionTypes.PROJECT_PROFILE_FIELD_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectProfileFieldUpdate = (projectProfileField) => ({
  type: ActionTypes.PROJECT_PROFILE_FIELD_UPDATE_HANDLE,
  payload: {
    projectProfileField,
  },
});

const deleteProjectProfileField = (id) => ({
  type: ActionTypes.PROJECT_PROFILE_FIELD_DELETE,
  payload: {
    id,
  },
});

deleteProjectProfileField.success = (projectProfileField) => ({
  type: ActionTypes.PROJECT_PROFILE_FIELD_DELETE__SUCCESS,
  payload: {
    projectProfileField,
  },
});

deleteProjectProfileField.failure = (id, error) => ({
  type: ActionTypes.PROJECT_PROFILE_FIELD_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectProfileFieldDelete = (projectProfileField) => ({
  type: ActionTypes.PROJECT_PROFILE_FIELD_DELETE_HANDLE,
  payload: {
    projectProfileField,
  },
});

const handleProjectProfileDataLoad = (data) => ({
  type: ActionTypes.PROJECT_PROFILE_DATA_LOAD_HANDLE,
  payload: {
    data,
  },
});

const handleProjectProfileDataSave = (data) => ({
  type: ActionTypes.PROJECT_PROFILE_DATA_SAVE_HANDLE,
  payload: {
    data,
  },
});

const handleProjectProfilePeopleLoad = (fieldId, people) => ({
  type: ActionTypes.PROJECT_PROFILE_PEOPLE_LOAD_HANDLE,
  payload: {
    fieldId,
    people,
  },
});

const createProjectProfilePerson = (data) => ({
  type: ActionTypes.PROJECT_PROFILE_PERSON_CREATE,
  payload: {
    data,
  },
});

createProjectProfilePerson.success = (localId, person) => ({
  type: ActionTypes.PROJECT_PROFILE_PERSON_CREATE__SUCCESS,
  payload: {
    localId,
    person,
  },
});

createProjectProfilePerson.failure = (localId, error) => ({
  type: ActionTypes.PROJECT_PROFILE_PERSON_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleProjectProfilePersonCreate = (person) => ({
  type: ActionTypes.PROJECT_PROFILE_PERSON_CREATE_HANDLE,
  payload: {
    person,
  },
});

const updateProjectProfilePerson = (id, data) => ({
  type: ActionTypes.PROJECT_PROFILE_PERSON_UPDATE,
  payload: {
    id,
    data,
  },
});

updateProjectProfilePerson.success = (person) => ({
  type: ActionTypes.PROJECT_PROFILE_PERSON_UPDATE__SUCCESS,
  payload: {
    person,
  },
});

updateProjectProfilePerson.failure = (id, error) => ({
  type: ActionTypes.PROJECT_PROFILE_PERSON_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectProfilePersonUpdate = (person) => ({
  type: ActionTypes.PROJECT_PROFILE_PERSON_UPDATE_HANDLE,
  payload: {
    person,
  },
});

const deleteProjectProfilePerson = (id) => ({
  type: ActionTypes.PROJECT_PROFILE_PERSON_DELETE,
  payload: {
    id,
  },
});

deleteProjectProfilePerson.success = (person) => ({
  type: ActionTypes.PROJECT_PROFILE_PERSON_DELETE__SUCCESS,
  payload: {
    person,
  },
});

deleteProjectProfilePerson.failure = (id, error) => ({
  type: ActionTypes.PROJECT_PROFILE_PERSON_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectProfilePersonDelete = (person) => ({
  type: ActionTypes.PROJECT_PROFILE_PERSON_DELETE_HANDLE,
  payload: {
    person,
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
  handleProjectProfileDataLoad,
  handleProjectProfileDataSave,
  handleProjectProfilePeopleLoad,
  createProjectProfilePerson,
  handleProjectProfilePersonCreate,
  updateProjectProfilePerson,
  handleProjectProfilePersonUpdate,
  deleteProjectProfilePerson,
  handleProjectProfilePersonDelete,
};
