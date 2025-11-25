/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /board-templates/{id}:
 *   get:
 *     summary: Get board template
 *     description: Retrieves a single board template with its lists and card types. Requires admin permissions.
 *     tags:
 *       - Board Templates
 *     operationId: getBoardTemplate
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the board template
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Board template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/BoardTemplate'
 *                 included:
 *                   type: object
 *                   properties:
 *                     lists:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BoardTemplateList'
 *                     cardTypes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BoardTemplateCardType'
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

    if (currentUser.role !== User.Roles.ADMIN) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const boardTemplate = await BoardTemplate.findOne({ id: inputs.id });

    if (!boardTemplate) {
      throw Errors.TEMPLATE_NOT_FOUND;
    }

    const lists = await BoardTemplateList.find({ boardTemplateId: boardTemplate.id }).sort(
      'position ASC',
    );

    const cardTypes = await BoardTemplateCardType.find({ boardTemplateId: boardTemplate.id });

    return {
      item: boardTemplate,
      included: {
        lists,
        cardTypes,
      },
    };
  },
};
