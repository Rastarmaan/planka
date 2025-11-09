/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * ProjectCategory.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectCategory:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the project category
 *           example: "1357158568008091264"
 *         name:
 *           type: string
 *           description: Name of the category
 *           example: Design
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of the category
 *           example: Design-related projects
 *         color:
 *           type: string
 *           nullable: true
 *           description: Color code for the category (hex)
 *           example: "#FF5733"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the category was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the category was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

module.exports = {
  tableName: 'project_category',

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: {
      type: 'string',
      required: true,
      unique: true,
      maxLength: 128,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
      maxLength: 1024,
    },
    color: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
      maxLength: 16,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    projects: {
      collection: 'Project',
      via: 'categoryId',
      through: 'ProjectCategoryAssignment',
    },
  },
};
