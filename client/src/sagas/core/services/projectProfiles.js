/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createProjectProfile(data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createProjectProfile({
      ...data,
      id: localId,
    }),
  );

  let projectProfile;
  let sections;
  let fields;
  try {
    ({
      item: projectProfile,
      sections,
      fields,
    } = yield call(request, api.createProjectProfile, data));
  } catch (error) {
    yield put(actions.createProjectProfile.failure(localId, error));
    return;
  }

  yield put(actions.createProjectProfile.success(localId, projectProfile, sections, fields));
}

export function* handleProjectProfileCreate(projectProfile, sections, fields) {
  yield put(actions.handleProjectProfileCreate(projectProfile, sections, fields));
}

export function* updateProjectProfile(id, data) {
  yield put(actions.updateProjectProfile(id, data));

  let projectProfile;
  try {
    ({ item: projectProfile } = yield call(request, api.updateProjectProfile, id, data));
  } catch (error) {
    yield put(actions.updateProjectProfile.failure(id, error));
    return;
  }

  yield put(actions.updateProjectProfile.success(projectProfile));
}

export function* handleProjectProfileUpdate(projectProfile) {
  yield put(actions.handleProjectProfileUpdate(projectProfile));
}

export function* deleteProjectProfile(id) {
  yield put(actions.deleteProjectProfile(id));

  let projectProfile;
  try {
    ({ item: projectProfile } = yield call(request, api.deleteProjectProfile, id));
  } catch (error) {
    yield put(actions.deleteProjectProfile.failure(id, error));
    return;
  }

  yield put(actions.deleteProjectProfile.success(projectProfile));
}

export function* handleProjectProfileDelete(projectProfile) {
  yield put(actions.handleProjectProfileDelete(projectProfile));
}

export function* createProjectProfileSection(profileId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createProjectProfileSection({
      ...data,
      id: localId,
      profileId,
    }),
  );

  let projectProfileSection;
  let fields;
  try {
    ({ item: projectProfileSection, fields } = yield call(
      request,
      api.createProjectProfileSection,
      profileId,
      data,
    ));
  } catch (error) {
    yield put(actions.createProjectProfileSection.failure(localId, error));
    return;
  }

  yield put(actions.createProjectProfileSection.success(localId, projectProfileSection, fields));
}

export function* handleProjectProfileSectionCreate(projectProfileSection, fields) {
  yield put(actions.handleProjectProfileSectionCreate(projectProfileSection, fields));
}

export function* updateProjectProfileSection(id, data) {
  yield put(actions.updateProjectProfileSection(id, data));

  let projectProfileSection;
  try {
    ({ item: projectProfileSection } = yield call(
      request,
      api.updateProjectProfileSection,
      id,
      data,
    ));
  } catch (error) {
    yield put(actions.updateProjectProfileSection.failure(id, error));
    return;
  }

  yield put(actions.updateProjectProfileSection.success(projectProfileSection));
}

export function* handleProjectProfileSectionUpdate(projectProfileSection) {
  yield put(actions.handleProjectProfileSectionUpdate(projectProfileSection));
}

export function* deleteProjectProfileSection(id) {
  yield put(actions.deleteProjectProfileSection(id));

  let projectProfileSection;
  try {
    ({ item: projectProfileSection } = yield call(request, api.deleteProjectProfileSection, id));
  } catch (error) {
    yield put(actions.deleteProjectProfileSection.failure(id, error));
    return;
  }

  yield put(actions.deleteProjectProfileSection.success(projectProfileSection));
}

export function* handleProjectProfileSectionDelete(projectProfileSection) {
  yield put(actions.handleProjectProfileSectionDelete(projectProfileSection));
}

export function* createProjectProfileField(sectionId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createProjectProfileField({
      ...data,
      id: localId,
      sectionId,
    }),
  );

  let projectProfileField;
  try {
    ({ item: projectProfileField } = yield call(
      request,
      api.createProjectProfileField,
      sectionId,
      data,
    ));
  } catch (error) {
    yield put(actions.createProjectProfileField.failure(localId, error));
    return;
  }

  yield put(actions.createProjectProfileField.success(localId, projectProfileField));
}

export function* handleProjectProfileFieldCreate(projectProfileField) {
  yield put(actions.handleProjectProfileFieldCreate(projectProfileField));
}

export function* updateProjectProfileField(id, data) {
  yield put(actions.updateProjectProfileField(id, data));

  let projectProfileField;
  try {
    ({ item: projectProfileField } = yield call(request, api.updateProjectProfileField, id, data));
  } catch (error) {
    yield put(actions.updateProjectProfileField.failure(id, error));
    return;
  }

  yield put(actions.updateProjectProfileField.success(projectProfileField));
}

export function* handleProjectProfileFieldUpdate(projectProfileField) {
  yield put(actions.handleProjectProfileFieldUpdate(projectProfileField));
}

export function* deleteProjectProfileField(id) {
  yield put(actions.deleteProjectProfileField(id));

  let projectProfileField;
  try {
    ({ item: projectProfileField } = yield call(request, api.deleteProjectProfileField, id));
  } catch (error) {
    yield put(actions.deleteProjectProfileField.failure(id, error));
    return;
  }

  yield put(actions.deleteProjectProfileField.success(projectProfileField));
}

export function* handleProjectProfileFieldDelete(projectProfileField) {
  yield put(actions.handleProjectProfileFieldDelete(projectProfileField));
}

export function* loadProjectProfileData(projectId) {
  let data;
  try {
    const response = yield call(request, api.getProjectProfileData, projectId);
    data = response.items || [];
  } catch (error) {
    // If no data exists yet, that's okay - just use empty array
    data = [];
  }

  yield put(actions.handleProjectProfileDataLoad(data));
}

export function* handleProjectProfileDataLoad(data) {
  yield put(actions.handleProjectProfileDataLoad(data));
}

export function* saveProjectProfileData(projectId, profileId, fieldValues) {
  let data;
  try {
    ({ items: data } = yield call(request, api.saveProjectProfileData, projectId, {
      profileId,
      fieldValues,
    }));
  } catch (error) {
    return;
  }

  yield put(actions.handleProjectProfileDataSave(data));
}

export function* handleProjectProfileDataSave(data) {
  yield put(actions.handleProjectProfileDataSave(data));
}
