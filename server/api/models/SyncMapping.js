/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * SyncMapping.js
 *
 * @description :: Model for tracking entity mappings between linked boards
 */

module.exports = {
  tableName: 'sync_mapping',
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
    boardLinkId: {
      type: 'string',
      columnName: 'board_link_id',
      required: true,
      autoMigrations: {
        columnType: 'bigint',
      },
    },
    entityType: {
      type: 'string',
      columnName: 'entity_type',
      isIn: ['card', 'list', 'label', 'board_membership', 'task', 'task_list', 'attachment'],
      required: true,
    },
    sourceEntityId: {
      type: 'string',
      columnName: 'source_entity_id',
      required: true,
      autoMigrations: {
        columnType: 'bigint',
      },
    },
    targetEntityId: {
      type: 'string',
      columnName: 'target_entity_id',
      required: true,
      autoMigrations: {
        columnType: 'bigint',
      },
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
