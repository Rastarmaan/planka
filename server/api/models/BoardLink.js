/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * BoardLink.js
 *
 * @description :: Model for tracking linked/synced boards across projects
 */

module.exports = {
  tableName: 'board_link',
  attributes: {
    id: {
      type: 'string',
      columnName: 'id',
      required: true,
      autoMigrations: {
        columnType: 'bigint',
        unique: true,
        autoIncrement: false,
      },
    },
    sourceBoardId: {
      type: 'string',
      columnName: 'source_board_id',
      required: true,
      autoMigrations: {
        columnType: 'bigint',
      },
    },
    linkedBoardId: {
      type: 'string',
      columnName: 'linked_board_id',
      required: true,
      autoMigrations: {
        columnType: 'bigint',
      },
    },
    syncEnabled: {
      type: 'boolean',
      columnName: 'sync_enabled',
      defaultsTo: true,
    },
    syncDirection: {
      type: 'string',
      columnName: 'sync_direction',
      isIn: ['bidirectional', 'one-way', 'none'],
      defaultsTo: 'bidirectional',
    },
    createdAt: {
      type: 'ref',
      columnName: 'created_at',
      autoCreatedAt: true,
      autoMigrations: {
        columnType: 'timestamp with time zone',
      },
    },
    updatedAt: {
      type: 'ref',
      columnName: 'updated_at',
      autoUpdatedAt: true,
      autoMigrations: {
        columnType: 'timestamp with time zone',
      },
    },
  },

  customToJSON() {
    return this;
  },

  beforeCreate(values, proceed) {
    if (!values.id) {
      throw new Error('id is required');
    }
    return proceed();
  },
};
