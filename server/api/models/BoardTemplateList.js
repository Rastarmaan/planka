/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * BoardTemplateList.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BoardTemplateList:
 *       type: object
 *       required:
 *         - id
 *         - boardTemplateId
 *         - name
 *         - position
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the template list
 *           example: "1357158568008091264"
 *         boardTemplateId:
 *           type: string
 *           description: ID of the board template
 *           example: "1357158568008091265"
 *         name:
 *           type: string
 *           description: Name of the list
 *           example: To Do
 *         position:
 *           type: number
 *           description: Position of the list in the template
 *           example: 65536
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the list was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the list was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

module.exports = {
  tableName: 'board_template_list',

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: {
      type: 'string',
      required: true,
    },
    position: {
      type: 'number',
      required: true,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    boardTemplateId: {
      model: 'BoardTemplate',
      required: true,
      columnName: 'board_template_id',
    },
  },
};
