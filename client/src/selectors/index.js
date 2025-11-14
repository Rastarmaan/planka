/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import activities from './activities';
import attachments from './attachments';
import backgroundImages from './background-images';
import baseCustomFieldGroups from './base-custom-field-groups';
import boardLinks from './board-links';
import boardMemberships from './board-memberships';
import boardReleases from './board-releases';
import boards from './boards';
import cardDependencies from './card-dependencies';
import cards from './cards';
import comments from './comments';
import common from './common';
import core from './core';
import customFieldGroups from './custom-field-groups';
import customFieldValues from './custom-field-values';
import customFields from './custom-fields';
import globalLabels from './global-labels';
import labels from './labels';
import lists from './lists';
import modals from './modals';
import notificationServices from './notification-services';
import notifications from './notifications';
import positioning from './positioning';
import projectCategories from './project-categories';
import projectManagers from './project-managers';
import projects from './projects';
import router from './router';
import taskLists from './task-lists';
import tasks from './tasks';
import users from './users';
import webhooks from './webhooks';

export default {
  ...router,
  ...common,
  ...core,
  ...modals,
  ...positioning,
  ...webhooks,
  ...users,
  ...projects,
  ...projectCategories,
  ...projectManagers,
  ...backgroundImages,
  ...baseCustomFieldGroups,
  ...boards,
  ...boardLinks,
  ...boardMemberships,
  ...boardReleases,
  ...cardDependencies,
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
};
