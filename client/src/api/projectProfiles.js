/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const getProjectProfiles = (headers) => socket.get('/project-profiles', undefined, headers);

const createProjectProfile = (data, headers) => {
  console.log('🟣 [API] createProjectProfile called with data:', data);
  return socket.post('/project-profiles', data, headers);
};

const getProjectProfile = (id, headers) =>
  socket.get(`/project-profiles/${id}`, undefined, headers);

const updateProjectProfile = (id, data, headers) =>
  socket.patch(`/project-profiles/${id}`, data, headers);

const deleteProjectProfile = (id, headers) =>
  socket.delete(`/project-profiles/${id}`, undefined, headers);

const createProjectProfileSection = (profileId, data, headers) => {
  return socket.post(`/project-profiles/${profileId}/sections`, data, headers);
};

const updateProjectProfileSection = (id, data, headers) =>
  socket.patch(`/project-profile-sections/${id}`, data, headers);

const deleteProjectProfileSection = (id, headers) =>
  socket.delete(`/project-profile-sections/${id}`, undefined, headers);

const createProjectProfileField = (sectionId, data, headers) =>
  socket.post(`/project-profile-sections/${sectionId}/fields`, data, headers);

const updateProjectProfileField = (id, data, headers) =>
  socket.patch(`/project-profile-fields/${id}`, data, headers);

const deleteProjectProfileField = (id, headers) =>
  socket.delete(`/project-profile-fields/${id}`, undefined, headers);

const getProjectProfileData = (projectId, headers) =>
  socket.get(`/projects/${projectId}/profile-data`, undefined, headers);

const saveProjectProfileData = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/profile-data`, data, headers);

const uploadProfileFile = (projectId, fieldId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return fetch(`/api/projects/${projectId}/profile-files/upload?fieldId=${fieldId}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  }).then((response) => response.json());
};

const getProfileFileUrl = (uploadedFileId, filename) =>
  `/api/profile-files/${uploadedFileId}/${filename}`;

const getProjectProfilePeople = (projectId, fieldId, headers) =>
  socket.get(`/projects/${projectId}/profile-people/${fieldId}`, undefined, headers);

const createProjectProfilePerson = (projectId, fieldId, data, headers) =>
  socket.post(`/projects/${projectId}/profile-people/${fieldId}`, data, headers);

const updateProjectProfilePerson = (id, data, headers) =>
  socket.patch(`/project-profile-people/${id}`, data, headers);

const deleteProjectProfilePerson = (id, headers) =>
  socket.delete(`/project-profile-people/${id}`, undefined, headers);

export default {
  getProjectProfiles,
  createProjectProfile,
  getProjectProfile,
  updateProjectProfile,
  deleteProjectProfile,
  createProjectProfileSection,
  updateProjectProfileSection,
  deleteProjectProfileSection,
  createProjectProfileField,
  updateProjectProfileField,
  deleteProjectProfileField,
  getProjectProfileData,
  saveProjectProfileData,
  uploadProfileFile,
  getProfileFileUrl,
  getProjectProfilePeople,
  createProjectProfilePerson,
  updateProjectProfilePerson,
  deleteProjectProfilePerson,
};
