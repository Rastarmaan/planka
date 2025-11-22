/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * ShareLink.js
 *
 * @description :: Document share link model for public access
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const ResourceTypes = {
  SPACE: 'space',
  FOLDER: 'folder',
  FILE: 'file',
};

module.exports = {
  tableName: 'share_link',

  ResourceTypes,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    token: {
      type: 'string',
      required: true,
      unique: true,
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
    isDownloadable: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'is_downloadable',
    },
    isPasswordProtected: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_password_protected',
    },
    passwordHash: {
      type: 'string',
      allowNull: true,
      columnName: 'password_hash',
    },
    expiresAt: {
      type: 'ref',
      columnType: 'timestamp with time zone',
      columnName: 'expires_at',
    },
    maxAccessCount: {
      type: 'number',
      allowNull: true,
      columnName: 'max_access_count',
    },
    accessCount: {
      type: 'number',
      defaultsTo: 0,
      columnName: 'access_count',
    },
    isActive: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'is_active',
    },
    lastAccessedAt: {
      type: 'ref',
      columnType: 'timestamp with time zone',
      columnName: 'last_accessed_at',
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

    createdByUser: {
      model: 'User',
      required: true,
      columnName: 'created_by_user_id',
    },
  },
};
