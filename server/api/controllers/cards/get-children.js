/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/{id}/children:
 *   get:
 *     summary: Get child cards
 *     description: Retrieves all child cards for a given parent card (story card). Requires board access permissions.
 *     tags:
 *       - Cards
 *     operationId: getChildCards
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the parent card (must be a story card)
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Child cards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - items
 *                 - included
 *               properties:
 *                 items:
 *                   type: array
 *                   description: Array of child cards
 *                   items:
 *                     $ref: '#/components/schemas/Card'
 *                 included:
 *                   type: object
 *                   required:
 *                     - users
 *                     - cardMemberships
 *                     - cardLabels
 *                     - taskLists
 *                     - tasks
 *                     - attachments
 *                     - customFieldGroups
 *                     - customFields
 *                     - customFieldValues
 *                   properties:
 *                     users:
 *                       type: array
 *                       description: Related users
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     cardMemberships:
 *                       type: array
 *                       description: Related card-membership associations
 *                       items:
 *                         $ref: '#/components/schemas/CardMembership'
 *                     cardLabels:
 *                       type: array
 *                       description: Related card-label associations
 *                       items:
 *                         $ref: '#/components/schemas/CardLabel'
 *                     taskLists:
 *                       type: array
 *                       description: Related task lists
 *                       items:
 *                         $ref: '#/components/schemas/TaskList'
 *                     tasks:
 *                       type: array
 *                       description: Related tasks
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *                     attachments:
 *                       type: array
 *                       description: Related attachments
 *                       items:
 *                         $ref: '#/components/schemas/Attachment'
 *                     customFieldGroups:
 *                       type: array
 *                       description: Related custom field groups
 *                       items:
 *                         $ref: '#/components/schemas/CustomFieldGroup'
 *                     customFields:
 *                       type: array
 *                       description: Related custom fields
 *                       items:
 *                         $ref: '#/components/schemas/CustomField'
 *                     customFieldValues:
 *                       type: array
 *                       description: Related custom field values
 *                       items:
 *                         $ref: '#/components/schemas/CustomFieldValue'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - code
 *                 - message
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Error code
 *                   example: E_FORBIDDEN
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: Not enough rights
 *       404:
 *         description: Parent card not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - code
 *                 - message
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Error code
 *                   example: E_NOT_FOUND
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: Card not found
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    id: idInput,
  },

  exits: {
    cardNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const parentCard = await Card.findOne(inputs.id);

    if (!parentCard) {
      throw Errors.CARD_NOT_FOUND;
    }

    const path = await sails.helpers.cards
      .getProjectPath(parentCard.id)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    let { board } = path;
    ({ board } = await sails.helpers.boards.getBoard(board.id));

    if (!sails.helpers.users.getBoardPermission(currentUser, board.users)) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const childCards = await Card.find({
      parentCardId: parentCard.id,
    }).sort('position ASC');

    const cardIds = childCards.map((card) => card.id);

    const [
      cardMemberships,
      cardLabels,
      taskLists,
      tasks,
      attachments,
      customFieldGroups,
      customFields,
      customFieldValues,
    ] = await Promise.all([
      cardIds.length > 0 ? CardMembership.find({ cardId: { in: cardIds } }) : [],
      cardIds.length > 0 ? CardLabel.find({ cardId: { in: cardIds } }) : [],
      cardIds.length > 0 ? TaskList.find({ cardId: { in: cardIds } }).sort('position ASC') : [],
      cardIds.length > 0 ? Task.find({ cardId: { in: cardIds } }).sort('position ASC') : [],
      cardIds.length > 0 ? Attachment.find({ cardId: { in: cardIds } }).sort('createdAt ASC') : [],
      cardIds.length > 0
        ? CustomFieldGroup.find({ cardId: { in: cardIds } }).sort('position ASC')
        : [],
      cardIds.length > 0
        ? CustomField.find({
            customFieldGroupId: {
              in: (await CustomFieldGroup.find({ cardId: { in: cardIds } })).map(
                (group) => group.id,
              ),
            },
          }).sort('position ASC')
        : [],
      cardIds.length > 0 ? CustomFieldValue.find({ cardId: { in: cardIds } }) : [],
    ]);

    const userIds = [
      ...new Set([
        ...childCards.map((card) => card.creatorUserId).filter(Boolean),
        ...cardMemberships.map((cardMembership) => cardMembership.userId),
        ...attachments.map((attachment) => attachment.creatorUserId).filter(Boolean),
      ]),
    ];

    const users = userIds.length > 0 ? await User.find({ id: { in: userIds } }) : [];

    return {
      items: childCards,
      included: {
        users,
        cardMemberships,
        cardLabels,
        taskLists,
        tasks,
        attachments,
        customFieldGroups,
        customFields,
        customFieldValues,
      },
    };
  },
};
