/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * DocumentFile.js
 *
 * @description :: Document management file model
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'document_file',

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: {
      type: 'string',
      required: true,
    },
    originalName: {
      type: 'string',
      required: true,
      columnName: 'original_name',
    },
    size: {
      type: 'string',
      required: true,
      columnType: 'bigint',
    },
    mimeType: {
      type: 'string',
      required: true,
      columnName: 'mime_type',
    },
    extension: {
      type: 'string',
      allowNull: true,
    },
    storagePath: {
      type: 'string',
      required: true,
      columnName: 'storage_path',
    },
    thumbnailPath: {
      type: 'string',
      allowNull: true,
      columnName: 'thumbnail_path',
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
    folder: {
      model: 'DocumentFolder',
      columnName: 'folder_id',
    },
    currentVersion: {
      model: 'DocumentFileVersion',
      columnName: 'current_version_id',
    },
    uploadedByUser: {
      model: 'User',
      required: true,
      columnName: 'uploaded_by_user_id',
    },
    deletedByUser: {
      model: 'User',
      columnName: 'deleted_by_user_id',
    },
    versions: {
      collection: 'DocumentFileVersion',
      via: 'file',
    },
  },
};
