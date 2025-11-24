/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const ROOT = '/';
const LOGIN = '/login';
const OIDC_CALLBACK = '/oidc-callback';
const PROJECTS = '/projects/:id';
const PROJECT_RELEASES = '/projects/:id/releases';
const BOARDS = '/boards/:id';
const CARDS = '/cards/:id';
const DOCUMENT_MANAGEMENT = '/document-management';
const DOCUMENT_ALL_FILES = '/document-management/all-files';
const DOCUMENT_SHARED = '/document-management/shared';
const DOCUMENT_RECENT = '/document-management/recent';
const DOCUMENT_STARRED = '/document-management/starred';
const DOCUMENT_TRASH = '/document-management/trash';
const PUBLIC_SHARE = '/public/:token';

export default {
  ROOT,
  LOGIN,
  OIDC_CALLBACK,
  PROJECTS,
  PROJECT_RELEASES,
  BOARDS,
  CARDS,
  DOCUMENT_MANAGEMENT,
  DOCUMENT_ALL_FILES,
  DOCUMENT_SHARED,
  DOCUMENT_RECENT,
  DOCUMENT_STARRED,
  DOCUMENT_TRASH,
  PUBLIC_SHARE,
};
