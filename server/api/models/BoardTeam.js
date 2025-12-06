/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * BoardTeam.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BoardTeam:
 *       type: object
 *       required:
 *         - id
 *         - boardId
 *         - teamId
 *         - role
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the board-team association
 *           example: "1357158568008091264"
 *         boardId:
 *           type: string
 *           description: ID of the board
 *           example: "1357158568008091265"
 *         teamId:
 *           type: string
 *           description: ID of the team
 *           example: "1357158568008091266"
 *         role:
 *           type: string
 *           enum: [editor, viewer]
 *           description: Role of the team in the board
 *           example: editor
 *         canComment:
 *           type: boolean
 *           nullable: true
 *           description: Whether the team can comment on cards (applies only to viewers)
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the association was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the association was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

const Roles = {
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

module.exports = {
  Roles,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    role: {
      type: 'string',
      isIn: Object.values(Roles),
      defaultsTo: Roles.EDITOR,
    },
    canComment: {
      type: 'boolean',
      allowNull: true,
      columnName: 'can_comment',
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
    teamId: {
      model: 'Team',
      required: true,
      columnName: 'team_id',
    },
  },

  tableName: 'board_team',
};
