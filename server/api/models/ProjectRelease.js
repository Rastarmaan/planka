/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * ProjectRelease.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectRelease:
 *       type: object
 *       required:
 *         - id
 *         - projectId
 *         - version
 *         - status
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the project release
 *           example: "1357158568008091264"
 *         projectId:
 *           type: string
 *           description: ID of the project this release belongs to
 *           example: "1357158568008091265"
 *         version:
 *           type: string
 *           description: Version string for the release
 *           example: "1.2.4"
 *         name:
 *           type: string
 *           nullable: true
 *           description: Optional name for the release
 *           example: "Spring 2024 Release"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Detailed description of the release
 *           example: "This release includes new features and bug fixes..."
 *         status:
 *           type: string
 *           enum: [unreleased, released]
 *           default: "unreleased"
 *           description: Status of the release
 *           example: "unreleased"
 *         targetDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Target date for the release
 *           example: "2024-03-15T10:00:00.000Z"
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
  UNRELEASED: 'unreleased',
  RELEASED: 'released',
};

module.exports = {
  Statuses,

  tableName: 'project_release',
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    version: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
      columnType: 'text',
    },
    status: {
      type: 'string',
      isIn: Object.values(Statuses),
      defaultsTo: Statuses.UNRELEASED,
    },
    targetDate: {
      type: 'ref',
      columnName: 'target_date',
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

    projectId: {
      model: 'Project',
      required: true,
      columnName: 'project_id',
    },
    cards: {
      collection: 'Card',
      via: 'releaseId',
    },
  },

  customToJSON() {
    return _.omit(this, ['projectId']);
  },

  beforeUpdate(values, proceed) {
    // Prevent changing version of released releases
    if (values.version && this.status === Statuses.RELEASED) {
      return proceed(new Error('Cannot change version of released release'));
    }

    // Set releasedAt when status changes to released
    if (values.status === Statuses.RELEASED && this.status !== Statuses.RELEASED) {
      // eslint-disable-next-line no-param-reassign
      values.releasedAt = new Date();
    }

    return proceed();
  },
};
