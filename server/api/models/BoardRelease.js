/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * BoardRelease.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BoardRelease:
 *       type: object
 *       required:
 *         - id
 *         - boardId
 *         - version
 *         - name
 *         - status
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the board release
 *           example: "1357158568008091264"
 *         boardId:
 *           type: string
 *           description: ID of the board this release belongs to
 *           example: "1357158568008091265"
 *         version:
 *           type: string
 *           maxLength: 50
 *           description: Version string for the release
 *           example: "v1.2.4"
 *         name:
 *           type: string
 *           maxLength: 255
 *           description: Name for the release
 *           example: "Authentication - Signup Feature"
 *         target:
 *           type: string
 *           nullable: true
 *           description: Target/goal description for the release
 *           example: "Implement complete signup flow with email verification and password reset"
 *         status:
 *           type: string
 *           enum: [planning, in_progress, testing, completed, released, cancelled]
 *           default: "planning"
 *           description: Current status of the release
 *           example: "in_progress"
 *         startDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Start date for the release work
 *           example: "2024-03-01T00:00:00.000Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Target end date for the release
 *           example: "2024-03-15T23:59:59.000Z"
 *         releasedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Actual date when the release was published
 *           example: "2024-03-15T14:30:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the release was created
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the release was last updated
 *           example: "2024-01-01T12:00:00.000Z"
 */

const Statuses = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  TESTING: 'testing',
  COMPLETED: 'completed',
  RELEASED: 'released',
  CANCELLED: 'cancelled',
};

module.exports = {
  Statuses,

  tableName: 'board_release',
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    version: {
      type: 'string',
      required: true,
      maxLength: 50,
    },
    name: {
      type: 'string',
      required: true,
      maxLength: 255,
    },
    target: {
      type: 'string',
      columnType: 'text',
    },
    status: {
      type: 'string',
      isIn: Object.values(Statuses),
      defaultsTo: Statuses.PLANNING,
    },
    startDate: {
      type: 'ref',
      columnName: 'start_date',
    },
    endDate: {
      type: 'ref',
      columnName: 'end_date',
    },
    releasedAt: {
      type: 'ref',
      columnName: 'released_at',
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
    cards: {
      collection: 'Card',
      via: 'releaseId',
      through: 'ReleaseCard',
    },
  },

  beforeUpdate(values, proceed) {
    if (values.version && this.status === Statuses.RELEASED) {
      return proceed(new Error('Cannot change version of released release'));
    }

    if (values.status === Statuses.RELEASED && this.status !== Statuses.RELEASED) {
      // eslint-disable-next-line no-param-reassign
      values.releasedAt = new Date();
    }

    return proceed();
  },
};
