/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import http from './http';
import Config from '../constants/Config';

const accessPublicLink = (token, password = null) => {
  if (password) {
    return http.post(`/public/${token}`, {
      password,
    });
  }
  return http.get(`/public/${token}`);
};

const downloadPublicFile = async (token, password = null) => {
  const url = new URL(`${Config.SERVER_BASE_URL}/api/public/${token}/download`);
  if (password) url.searchParams.append('password', password);

  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      throw data;
    } catch (e) {
      throw text || `HTTP ${res.status}`;
    }
  }

  const blob = await res.blob();
  return blob;
};

const previewPublicFile = async (token, password = null) => {
  const url = new URL(`${Config.SERVER_BASE_URL}/api/public/${token}/preview`);
  if (password) url.searchParams.append('password', password);

  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      throw data;
    } catch (e) {
      throw text || `HTTP ${res.status}`;
    }
  }

  const blob = await res.blob();
  return blob;
};

const downloadPublicFolder = async (token, password = null) => {
  const url = new URL(`${Config.SERVER_BASE_URL}/api/public/${token}/download-folder`);
  if (password) url.searchParams.append('password', password);

  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      throw data;
    } catch (e) {
      throw text || `HTTP ${res.status}`;
    }
  }

  const blob = await res.blob();
  return blob;
};

const previewFolderFile = async (token, fileId, password = null) => {
  const url = new URL(`${Config.SERVER_BASE_URL}/api/public/${token}/file/${fileId}/preview`);
  if (password) url.searchParams.append('password', password);

  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      throw data;
    } catch (e) {
      throw text || `HTTP ${res.status}`;
    }
  }

  const blob = await res.blob();
  return blob;
};

const downloadFolderFile = async (token, fileId, password = null) => {
  const url = new URL(`${Config.SERVER_BASE_URL}/api/public/${token}/file/${fileId}/download`);
  if (password) url.searchParams.append('password', password);

  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      throw data;
    } catch (e) {
      throw text || `HTTP ${res.status}`;
    }
  }

  const blob = await res.blob();
  return blob;
};

export default {
  accessPublicLink,
  downloadPublicFile,
  previewPublicFile,
  downloadPublicFolder,
  previewFolderFile,
  downloadFolderFile,
};
