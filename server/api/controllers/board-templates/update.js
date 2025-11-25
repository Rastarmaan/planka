/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /board-templates/{id}:
 *   patch:
 *     summary: Update board template
 *     description: Updates a board template. Requires admin permissions.
 *     tags:
 *       - Board Templates
 *     operationId: updateBoardTemplate
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the template
 *                 example: Agile Sprint Template
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Description of the template
 *                 example: Updated description
 *               isListsLocked:
 *                 type: boolean
 *                 description: Whether lists are locked for users
 *                 example: false
 *     responses:
 *       200:
 *         description: Board template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/BoardTemplate'
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
    },
    description: {
      type: 'string',
      allowNull: true,
    },
    isListsLocked: {
      type: 'boolean',
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

    const values = _.pick(inputs, ['name', 'description', 'isListsLocked']);

    const updatedTemplate = await BoardTemplate.updateOne({ id: inputs.id }).set(values);

    return {
      item: updatedTemplate,
    };
  },
};
