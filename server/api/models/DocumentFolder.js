/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * DocumentFolder.js
 *
 * @description :: Document management folder model
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'document_folder',

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: {
      type: 'string',
      required: true,
    },
    path: {
      type: 'string',
      required: true,
    },
    isDeleted: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_deleted',
    },
    deletedAt: {
      type: 'ref',
      columnType: 'timestamp with time zone',
      columnName: 'deleted_at',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    space: {
      model: 'Space',
      required: true,
      columnName: 'space_id',
    },
    parentFolder: {
      model: 'DocumentFolder',
      columnName: 'parent_folder_id',
    },
    createdByUser: {
      model: 'User',
      required: true,
      columnName: 'created_by_user_id',
    },
    deletedByUser: {
      model: 'User',
      columnName: 'deleted_by_user_id',
    },
    childFolders: {
      collection: 'DocumentFolder',
      via: 'parentFolder',
    },
    files: {
      collection: 'DocumentFile',
      via: 'folder',
    },
  },
};
