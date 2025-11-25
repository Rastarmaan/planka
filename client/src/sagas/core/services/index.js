/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import activities from './activities';
import attachments from './attachments';
import backgroundImages from './background-images';
import baseCustomFieldGroups from './base-custom-field-groups';
import boardMemberships from './board-memberships';
import boardReleases from './board-releases';
import boards from './boards';
import cards from './cards';
import comments from './comments';
import core from './core';
import customFieldGroups from './custom-field-groups';
import customFieldValues from './custom-field-values';
import customFields from './custom-fields';
import globalLabels from './global-labels';
import googleCalendar from './google-calendar';
import labels from './labels';
import lists from './lists';
import modals from './modals';
import notificationServices from './notification-services';
import notifications from './notifications';
import projectCategories from './project-categories';
import projectManagers from './project-managers';
import projects from './projects';
import router from './router';
import socket from './socket';
import taskLists from './task-lists';
import tasks from './tasks';
import users from './users';
import webhooks from './webhooks';
import * as spaces from './spaces';
import * as folders from './folders';
import * as files from './files';
import * as permissions from './permissions';
import * as shareLinks from './share-links';
import fetchDocumentActivities from './document-activities';

export default {
  ...router,
  ...socket,
  ...core,
  ...modals,
  ...webhooks,
  ...users,
  ...projects,
  ...spaces,
  ...folders,
  ...files,
  ...permissions,
  ...shareLinks,
  ...projectCategories,
  ...projectManagers,
  ...backgroundImages,
  ...baseCustomFieldGroups,
  ...boards,
  ...boardMemberships,
  ...boardReleases,
  ...labels,
  ...globalLabels,
  ...lists,
  ...cards,
  ...taskLists,
  ...tasks,
  ...attachments,
  ...customFieldGroups,
  ...customFields,
  ...customFieldValues,
  ...comments,
  ...activities,
  ...notifications,
  ...notificationServices,
  ...googleCalendar,
  fetchDocumentActivities,
};
