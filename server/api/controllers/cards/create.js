/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /lists/{listId}/cards:
 *   post:
 *     summary: Create card
 *     description: Creates a card within a list. Requires board editor permissions.
 *     tags:
 *       - Cards
 *     operationId: createCard
 *     parameters:
 *       - name: listId
 *         in: path
 *         required: true
 *         description: ID of the list to create the card in
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - name
 *             properties:
 *               parentCardId:
 *                 type: string
 *                 nullable: true
 *                 description: ID of the parent card (must be a STORY card)
 *                 example: "1357158568008091270"
 *               type:
 *                 type: string
 *                 enum: [project, story]
 *                 description: Type of the card
 *                 example: project
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 description: Position of the card within the list
 *                 example: 65536
 *               name:
 *                 type: string
 *                 maxLength: 1024
 *                 description: Name/title of the card
 *                 example: Implement user authentication
 *               description:
 *                 type: string
 *                 maxLength: 1048576
 *                 nullable: true
 *                 description: Detailed description of the card
 *                 example: Add JWT-based authentication system...
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date for the card
 *                 example: 2024-01-01T00:00:00.000Z
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Due date for the card
 *                 example: 2024-01-01T00:00:00.000Z
 *               isDueCompleted:
 *                 type: boolean
 *                 nullable: true
 *                 description: Whether the due date is completed
 *                 example: false
 *               stopwatch:
 *                 type: object
 *                 required:
 *                   - startedAt
 *                   - total
 *                 nullable: true
 *                 description: Stopwatch data for time tracking
 *                 properties:
 *                   startedAt:
 *                     type: string
 *                     format: date-time
 *                     description: When the stopwatch was started
 *                     example: 2024-01-01T00:00:00.000Z
 *                   total:
 *                     type: number
 *                     description: Total time in seconds
 *                     example: 3600
 *               weight:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 1
 *                 description: Weight/priority of the card (1-10)
 *                 example: 5
 *               storyPoints:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 50
 *                 nullable: true
 *                 description: Story points for the card (1-50)
 *                 example: 8
 *     responses:
 *       200:
 *         description: Card created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Card'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 */

const { isDueDate, isStopwatch } = require('../../../utils/validators');
const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
  POSITION_MUST_BE_PRESENT: {
    positionMustBePresent: 'Position must be present',
  },
  PARENT_CARD_NOT_FOUND: {
    parentCardNotFound: 'Parent card not found',
  },
  PARENT_CARD_MUST_BE_STORY: {
    parentCardMustBeStory: 'Parent card must be a story, epic, or task type',
  },
};

module.exports = {
  inputs: {
    listId: {
      ...idInput,
      required: true,
    },
    type: {
      type: 'string',
      isIn: Object.values(Card.Types),
      required: true,
    },
    position: {
      type: 'number',
      min: 0,
      allowNull: true,
    },
    name: {
      type: 'string',
      maxLength: 1024,
      required: true,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1048576,
      allowNull: true,
    },
    startDate: {
      type: 'string',
      custom: isDueDate,
    },
    dueDate: {
      type: 'string',
      custom: isDueDate,
    },
    isDueCompleted: {
      type: 'boolean',
      allowNull: true,
    },
    stopwatch: {
      type: 'json',
      custom: isStopwatch,
    },
    parentCardId: {
      type: 'string',
      allowNull: true,
    },
    weight: {
      type: 'number',
      min: 1,
      max: 10,
    },
    storyPoints: {
      type: 'number',
      min: 1,
      max: 50,
      allowNull: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    listNotFound: {
      responseType: 'notFound',
    },
    positionMustBePresent: {
      responseType: 'unprocessableEntity',
    },
    parentCardNotFound: {
      responseType: 'notFound',
    },
    parentCardMustBeStory: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { list, board, project } = await sails.helpers.lists
      .getPathToProjectById(inputs.listId)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const isAdmin = currentUser.role === User.Roles.ADMIN;
    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    const hasEditorRights =
      isAdmin ||
      isProjectManager ||
      (boardMembership && boardMembership.role === BoardMembership.Roles.EDITOR);

    if (!hasEditorRights) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (inputs.parentCardId) {
      const parentCard = await Card.findOne({
        id: inputs.parentCardId,
        boardId: board.id,
      });

      if (!parentCard) {
        throw Errors.PARENT_CARD_NOT_FOUND;
      }

      if (
        parentCard.type !== Card.Types.STORY &&
        parentCard.type !== Card.Types.EPIC &&
        parentCard.type !== Card.Types.PROJECT
      ) {
        throw Errors.PARENT_CARD_MUST_BE_STORY;
      }
    }

    const values = _.pick(inputs, [
      'type',
      'position',
      'name',
      'description',
      'dueDate',
      'isDueCompleted',
      'stopwatch',
      'parentCardId',
      'weight',
      'storyPoints',
    ]);

    const card = await sails.helpers.cards.createOne
      .with({
        project,
        values: {
          ...values,
          board,
          list,
          creatorUser: currentUser,
        },
        request: this.req,
      })
      .intercept('positionMustBeInValues', () => Errors.POSITION_MUST_BE_PRESENT);

    return {
      item: card,
    };
  },
};
