/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * BoardVersion.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BoardVersion:
 *       type: object
 *       required:
 *         - id
 *         - boardId
 *         - name
 *         - snapshotData
 *         - isAutoCreated
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the board version
 *           example: "1357158568008091264"
 *         boardId:
 *           type: string
 *           description: ID of the board this version belongs to
 *           example: "1357158568008091265"
 *         creatorUserId:
 *           type: string
 *           nullable: true
 *           description: ID of the user who created this version
 *           example: "1357158568008091266"
 *         name:
 *           type: string
 *           description: Name/title of the version
 *           example: "Sprint 1 Completion"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of what changed in this version
 *           example: "Completed all user stories for sprint 1"
 *         snapshotData:
 *           type: object
 *           description: Complete serialized board state
 *           example: {"board": {...}, "lists": [...], "cards": [...]}
 *         metadata:
 *           type: object
 *           nullable: true
 *           description: Additional metadata about the version
 *           example: {"cardCount": 15, "listCount": 4, "attachmentCount": 8}
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

    boardId: {
      model: 'Board',
      required: true,
      columnName: 'board_id',
    },
    creatorUserId: {
      model: 'User',
      columnName: 'creator_user_id',
    },
  },

  tableName: 'board_version',
};
