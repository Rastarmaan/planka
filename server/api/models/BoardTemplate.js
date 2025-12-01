/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * BoardTemplate.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BoardTemplate:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - isListsLocked
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the board template
 *           example: "1357158568008091264"
 *         name:
 *           type: string
 *           description: Name of the template
 *           example: Agile Sprint Template
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of the template
 *           example: Template for agile sprint planning with predefined lists
 *         isListsLocked:
 *           type: boolean
 *           default: false
 *           description: Whether lists can be modified by users
 *           example: true
 *         createdByUserId:
 *           type: string
 *           nullable: true
 *           description: ID of the admin user who created the template
 *           example: "1357158568008091265"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the template was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the template was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

module.exports = {
  tableName: 'board_template',

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      allowNull: true,
    },
    isListsLocked: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_lists_locked',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    createdByUserId: {
      model: 'User',
      columnName: 'created_by_user_id',
    },
    lists: {
      collection: 'BoardTemplateList',
      via: 'boardTemplateId',
    },
    cardTypes: {
      collection: 'BoardTemplateCardType',
      via: 'boardTemplateId',
    },
    boards: {
      collection: 'Board',
      via: 'templateId',
    },
  },
};
