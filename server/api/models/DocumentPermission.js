/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * DocumentPermission.js
 *
 * @description :: Document permission model for user-based access control
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const ResourceTypes = {
  SPACE: 'space',
  FOLDER: 'folder',
  FILE: 'file',
};

module.exports = {
  tableName: 'document_permission',

  ResourceTypes,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

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
    canView: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'can_view',
    },
    canDownload: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'can_download',
    },
    canEdit: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'can_edit',
    },
    canDelete: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'can_delete',
    },
    canShare: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'can_share',
    },
    inheritFromParent: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'inherit_from_parent',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    user: {
      model: 'User',
      required: true,
      columnName: 'user_id',
    },
    grantedByUser: {
      model: 'User',
      required: true,
      columnName: 'granted_by_user_id',
    },
  },
};
