/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * DocumentFileVersion.js
 *
 * @description :: Document file version history model
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'document_file_version',

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    versionNumber: {
      type: 'number',
      required: true,
      columnName: 'version_number',
    },
    name: {
      type: 'string',
      required: true,
    },
    size: {
      type: 'string',
      required: true,
      columnType: 'bigint',
    },
    storagePath: {
      type: 'string',
      required: true,
      columnName: 'storage_path',
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

    file: {
      model: 'DocumentFile',
      required: true,
      columnName: 'file_id',
    },
    uploadedByUser: {
      model: 'User',
      required: true,
      columnName: 'uploaded_by_user_id',
    },
  },
};
