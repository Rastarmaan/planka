/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { ORM } from 'redux-orm';

import {
  Activity,
  Attachment,
  BackgroundImage,
  BaseCustomFieldGroup,
  Board,
  BoardLink,
  BoardMembership,
  BoardRelease,
  Card,
  CardDependency,
  Comment,
  CustomField,
  CustomFieldGroup,
  CustomFieldValue,
  Label,
  List,
  Notification,
  NotificationService,
  Project,
  ProjectCategory,
  ProjectCategoryAssignment,
  ProjectManager,
  ReleaseCard,
  Task,
  TaskList,
  User,
  Webhook,
  Space,
  Folder,
  File,
  Permission,
} from './models';

const orm = new ORM({
  stateSelector: (state) => state.orm,
});

orm.register(
  Webhook,
  User,
  Space,
  Folder,
  File,
  Permission,
  Project,
  ProjectCategory,
  ProjectCategoryAssignment,
  ProjectManager,
  BackgroundImage,
  BaseCustomFieldGroup,
  Board,
  BoardLink,
  BoardMembership,
  BoardRelease,
  Label,
  List,
  Card,
  ReleaseCard,
  CardDependency,
  TaskList,
  Task,
  Attachment,
  CustomFieldGroup,
  CustomField,
  CustomFieldValue,
  Comment,
  Activity,
  Notification,
  NotificationService,
);

export default orm;
