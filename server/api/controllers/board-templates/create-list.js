/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /board-templates/{id}/lists:
 *   post:
 *     summary: Add list to board template
 *     description: Adds a list to a board template. Requires admin permissions.
 *     tags:
 *       - Board Templates
 *     operationId: addListToBoardTemplate
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
 *               - name
 *               - position
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the list
 *                 example: To Do
 *               position:
 *                 type: number
 *                 description: Position of the list
 *                 example: 65536
 *     responses:
 *       200:
 *         description: List added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/BoardTemplateList'
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
    name: {
      type: 'string',
      required: true,
    },
    position: {
      type: 'number',
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

    if (!User.isAdminLevel(currentUser)) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const boardTemplate = await BoardTemplate.findOne({ id: inputs.id });

    if (!boardTemplate) {
      throw Errors.TEMPLATE_NOT_FOUND;
    }

    const list = await BoardTemplateList.create({
      boardTemplateId: inputs.id,
      name: inputs.name,
      position: inputs.position,
    }).fetch();

    return {
      item: list,
    };
  },
};
