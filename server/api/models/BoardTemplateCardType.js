/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * BoardTemplateCardType.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BoardTemplateCardType:
 *       type: object
 *       required:
 *         - id
 *         - boardTemplateId
 *         - typeName
 *         - isDefault
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the template card type
 *           example: "1357158568008091264"
 *         boardTemplateId:
 *           type: string
 *           description: ID of the board template
 *           example: "1357158568008091265"
 *         typeName:
 *           type: string
 *           description: Name of the card type
 *           example: story
 *         color:
 *           type: string
 *           nullable: true
 *           description: Color associated with the card type
 *           example: "#4CAF50"
 *         isDefault:
 *           type: boolean
 *           default: false
 *           description: Whether this is the default card type
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the card type was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the card type was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

module.exports = {
  tableName: 'board_template_card_type',

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    typeName: {
      type: 'string',
      required: true,
      columnName: 'type_name',
    },
    color: {
      type: 'string',
      allowNull: true,
    },
    isDefault: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_default',
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
