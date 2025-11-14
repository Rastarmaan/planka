/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * ReleaseCard.js
 *
 * @description :: Junction table linking releases to cards (epics, stories, tasks)
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ReleaseCard:
 *       type: object
 *       required:
 *         - id
 *         - releaseId
 *         - cardId
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the release-card association
 *           example: "1357158568008091264"
 *         releaseId:
 *           type: string
 *           description: ID of the release
 *           example: "1357158568008091265"
 *         cardId:
 *           type: string
 *           description: ID of the card (can be epic, story, or task)
 *           example: "1357158568008091266"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the association was created
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the association was last updated
 *           example: "2024-01-01T12:00:00.000Z"
 */

module.exports = {
  tableName: 'release_card',
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    releaseId: {
      model: 'BoardRelease',
      required: true,
      columnName: 'release_id',
    },
    cardId: {
      model: 'Card',
      required: true,
      columnName: 'card_id',
    },
  },
};
