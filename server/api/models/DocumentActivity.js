/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * DocumentActivity.js
 *
 * @description :: Document activity log model for audit trail
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Actions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  DOWNLOAD: 'download',
  SHARE: 'share',
  UPLOAD: 'upload',
  MOVE: 'move',
  RESTORE: 'restore',
};

const ResourceTypes = {
  SPACE: 'space',
  FOLDER: 'folder',
  FILE: 'file',
  PERMISSION: 'permission',
  SHARE_LINK: 'shareLink',
};

module.exports = {
  tableName: 'document_activity',

  Actions,
  ResourceTypes,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    action: {
      type: 'string',
      required: true,
      isIn: Object.values(Actions),
    },
    resourceType: {
      type: 'string',
      required: true,
      isIn: Object.values(ResourceTypes),
      columnName: 'resource_type',
    },
    resourceId: {
      type: 'string',
      required: true,
      columnType: 'bigint',
      columnName: 'resource_id',
    },
    resourceName: {
      type: 'string',
      required: true,
      columnName: 'resource_name',
    },
    metadata: {
      type: 'json',
      columnType: 'jsonb',
    },
    ipAddress: {
      type: 'string',
      allowNull: true,
      columnName: 'ip_address',
    },
    userAgent: {
      type: 'string',
      allowNull: true,
      columnName: 'user_agent',
    },
    createdAt: {
      type: 'number',
      columnName: 'created_at',
      autoCreatedAt: true,
    },
    updatedAt: false,

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    user: {
      model: 'User',
      columnName: 'user_id',
    },
  },
};
