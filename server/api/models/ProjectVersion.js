/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * ProjectVersion.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectVersion:
 *       type: object
 *       required:
 *         - id
 *         - projectId
 *         - name
 *         - snapshotData
 *         - isAutoCreated
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the project version
 *           example: "1357158568008091264"
 *         projectId:
 *           type: string
 *           description: ID of the project this version belongs to
 *           example: "1357158568008091265"
 *         creatorUserId:
 *           type: string
 *           nullable: true
 *           description: ID of the user who created this version
 *           example: "1357158568008091266"
 *         name:
 *           type: string
 *           description: Name/title of the version
 *           example: "Q4 2024 Release"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of what changed in this version
 *           example: "Major project restructuring with new boards and workflows"
 *         snapshotData:
 *           type: object
 *           description: Complete serialized project state including all boards, lists, and cards
 *           example: {"project": {...}, "boards": [...], "lists": [...], "cards": [...]}
 *         metadata:
 *           type: object
 *           nullable: true
 *           description: Additional metadata about the version
 *           example: {"boardCount": 5, "cardCount": 120, "totalLists": 25}
 *         isAutoCreated:
 *           type: boolean
 *           default: false
 *           description: Whether this version was created automatically
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the version was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the version was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: {
      type: 'string',
      required: true,
      maxLength: 255,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
      maxLength: 2000,
    },
    snapshotData: {
      type: 'json',
      required: true,
      columnName: 'snapshot_data',
    },
    metadata: {
      type: 'json',
    },
    isAutoCreated: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_auto_created',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    projectId: {
      model: 'Project',
      required: true,
      columnName: 'project_id',
    },
    creatorUserId: {
      model: 'User',
      columnName: 'creator_user_id',
    },
  },

  tableName: 'project_version',
};
