/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
  'download',
  'share',
  'upload',
  'move',
  'restore',
];
const RESOURCE_TYPES = ['space', 'folder', 'file', 'permission', 'shareLink'];

module.exports = {
  inputs: {
    user: {
      type: 'ref',
    },
    action: {
      type: 'string',
      required: true,
      isIn: ACTIONS,
    },
    resourceType: {
      type: 'string',
      required: true,
      isIn: RESOURCE_TYPES,
    },
    resourceId: {
      type: 'number',
      required: true,
    },
    resourceName: {
      type: 'string',
      required: true,
    },
    metadata: {
      type: 'json',
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const activityData = {
      userId: inputs.user ? inputs.user.id : null,
      action: inputs.action,
      resourceType: inputs.resourceType,
      resourceId: inputs.resourceId,
      resourceName: inputs.resourceName,
      metadata: inputs.metadata,
    };

    if (inputs.request) {
      activityData.ipAddress = inputs.request.ip;
      activityData.userAgent = inputs.request.get('user-agent');
    }

    const activity = await DocumentActivity.create(activityData).fetch();

    return activity;
  },
};
