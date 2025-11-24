/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import accessTokens from './access-tokens';
import activities from './activities';
import attachments from './attachments';
import backgroundImages from './background-images';
import baseCustomFieldGroups from './base-custom-field-groups';
import boardMemberships from './board-memberships';
import boardVersions from './board-versions';
import boards from './boards';
import cardDependencies from './card-dependencies';
import cardLabels from './card-labels';
import cardMemberships from './card-memberships';
import cards from './cards';
import comments from './comments';
import config from './config';
import customFieldGroups from './custom-field-groups';
import customFieldValues from './custom-field-values';
import customFields from './custom-fields';
import googleCalendar from './google-calendar';
import http from './http';
import labels from './labels';
import lists from './lists';
import notificationServices from './notification-services';
import notifications from './notifications';
import projectCategories from './project-categories';
import projectManagers from './project-managers';
import projectVersions from './project-versions';
import projects from './projects';
import socket from './socket';
import taskLists from './task-lists';
import tasks from './tasks';
import terms from './terms';
import users from './users';
import webhooks from './webhooks';
import spaces from './spaces';
import folders from './folders';
import files from './files';
import permissions from './permissions';
import shareLinks from './share-links';

export { http, socket };

export default {
  ...config,
  ...terms,
  ...accessTokens,
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
  ...projectVersions,
  ...backgroundImages,
  ...baseCustomFieldGroups,
  ...boards,
  ...boardMemberships,
  ...boardVersions,
  ...labels,
  ...lists,
  ...cards,
  ...cardMemberships,
  ...cardDependencies,
  ...cardLabels,
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
};
