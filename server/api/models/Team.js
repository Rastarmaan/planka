/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Team.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the team
 *           example: "1357158568008091264"
 *         name:
 *           type: string
 *           description: Name of the team
 *           example: "Development Team"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of the team
 *           example: "Team responsible for product development"
 *         creatorUserId:
 *           type: string
 *           nullable: true
 *           description: ID of the user who created the team
 *           example: "1357158568008091265"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the team was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the team was last updated
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
      allowNull: true,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    creatorUserId: {
      model: 'User',
      columnName: 'creator_user_id',
    },
    memberships: {
      collection: 'TeamMembership',
      via: 'teamId',
    },
    projectTeams: {
      collection: 'ProjectTeam',
      via: 'teamId',
    },
    boardTeams: {
      collection: 'BoardTeam',
      via: 'teamId',
    },
  },

  tableName: 'team',
};
