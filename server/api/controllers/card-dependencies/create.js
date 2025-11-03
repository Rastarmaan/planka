/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/{cardId}/card-dependencies:
 *   post:
 *     summary: Add dependency to card
 *     description: Creates a dependency between two cards. The card becomes dependent on another card. Requires board editor permissions.
 *     tags:
 *       - Card Dependencies
 *     operationId: createCardDependency
 *     parameters:
 *       - name: cardId
 *         in: path
 *         required: true
 *         description: ID of the card that will depend on another card
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
 *               - dependsOnCardId
 *             properties:
 *               dependsOnCardId:
 *                 type: string
 *                 description: ID of the card that this card depends on
 *                 example: "1357158568008091265"
 *     responses:
 *       200:
 *         description: Dependency added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/CardDependency'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  DEPENDS_ON_CARD_NOT_FOUND: {
    dependsOnCardNotFound: 'Dependency card not found',
  },
  CARDS_NOT_IN_SAME_BOARD: {
    cardsNotInSameBoard: 'Cards must be in the same board',
  },
  DEPENDENCY_ALREADY_EXISTS: {
    dependencyAlreadyExists: 'Dependency already exists',
  },
  CIRCULAR_DEPENDENCY: {
    circularDependency: 'Creating this dependency would create a circular dependency',
  },
};

module.exports = {
  inputs: {
    cardId: {
      ...idInput,
      required: true,
    },
    dependsOnCardId: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
    dependsOnCardNotFound: {
      responseType: 'notFound',
    },
    cardsNotInSameBoard: {
      responseType: 'badRequest',
    },
    dependencyAlreadyExists: {
      responseType: 'conflict',
    },
    circularDependency: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card, list, board, project } = await sails.helpers.cards
      .getPathToProjectById(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND;
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const dependsOnCard = await Card.qm.getOneById(inputs.dependsOnCardId);

    if (!dependsOnCard) {
      throw Errors.DEPENDS_ON_CARD_NOT_FOUND;
    }

    if (card.boardId !== dependsOnCard.boardId) {
      throw Errors.CARDS_NOT_IN_SAME_BOARD;
    }

    const cardDependency = await sails.helpers.cardDependencies.createOne
      .with({
        project,
        board,
        list,
        values: {
          card,
          dependsOnCard,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('dependencyAlreadyExists', () => Errors.DEPENDENCY_ALREADY_EXISTS)
      .intercept('circularDependency', () => Errors.CIRCULAR_DEPENDENCY);

    return {
      item: cardDependency,
    };
  },
};
