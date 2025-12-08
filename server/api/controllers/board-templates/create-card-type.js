/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /board-templates/{id}/card-types:
 *   post:
 *     summary: Add card type to board template
 *     description: Adds a card type to a board template. Requires admin permissions.
 *     tags:
 *       - Board Templates
 *     operationId: addCardTypeToBoardTemplate
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the board template
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
 *               - typeName
 *             properties:
 *               typeName:
 *                 type: string
 *                 description: Name of the card type
 *                 example: story
 *               color:
 *                 type: string
 *                 nullable: true
 *                 description: Color for the card type
 *                 example: "#4CAF50"
 *               isDefault:
 *                 type: boolean
 *                 default: false
 *                 description: Whether this is the default card type
 *                 example: false
 *     responses:
 *       200:
 *         description: Card type added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/BoardTemplateCardType'
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
  TEMPLATE_NOT_FOUND: {
    templateNotFound: 'Template not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    typeName: {
      type: 'string',
      required: true,
    },
    color: {
      type: 'string',
      allowNull: true,
    },
    isDefault: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    templateNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!User.isAdminLevel(currentUser)) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const boardTemplate = await BoardTemplate.findOne({ id: inputs.id });

    if (!boardTemplate) {
      throw Errors.TEMPLATE_NOT_FOUND;
    }

    const cardType = await BoardTemplateCardType.create({
      boardTemplateId: inputs.id,
      typeName: inputs.typeName,
      color: inputs.color,
      isDefault: inputs.isDefault,
    }).fetch();

    return {
      item: cardType,
    };
  },
};
