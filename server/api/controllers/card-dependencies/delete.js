/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/{cardId}/card-dependencies/dependsOnCardId:{dependsOnCardId}:
 *   delete:
 *     summary: Remove dependency from card
 *     description: Removes a dependency relationship between two cards. Requires board editor permissions.
 *     tags:
 *       - Card Dependencies
 *     operationId: deleteCardDependency
 *     parameters:
 *       - name: cardId
 *         in: path
 *         required: true
 *         description: ID of the card to remove the dependency from
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: dependsOnCardId
 *         in: path
 *         required: true
 *         description: ID of the card that was depended on
 *         schema:
 *           type: string
 *           example: "1357158568008091265"
 *     responses:
 *       200:
 *         description: Dependency removed successfully
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
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  DEPENDENCY_NOT_FOUND: {
    dependencyNotFound: 'Dependency not found',
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
    dependencyNotFound: {
      responseType: 'notFound',
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

    let cardDependency = await CardDependency.qm.getOneByCardIdAndDependsOnCardId(
      inputs.cardId,
      inputs.dependsOnCardId,
    );

    if (!cardDependency) {
      throw Errors.DEPENDENCY_NOT_FOUND;
    }

    const dependsOnCard = await Card.qm.getOneById(cardDependency.dependsOnCardId);

    cardDependency = await sails.helpers.cardDependencies.deleteOne.with({
      project,
      board,
      list,
      card,
      dependsOnCard,
      record: cardDependency,
      actorUser: currentUser,
      request: this.req,
    });

    if (!cardDependency) {
      throw Errors.DEPENDENCY_NOT_FOUND;
    }

    return {
      item: cardDependency,
    };
  },
};
