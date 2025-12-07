/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /board-templates:
 *   post:
 *     summary: Create board template
 *     description: Creates a new board template. Requires admin permissions.
 *     tags:
 *       - Board Templates
 *     operationId: createBoardTemplate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the template
 *                 example: Agile Sprint Template
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Description of the template
 *                 example: Template for agile sprint planning
 *               isListsLocked:
 *                 type: boolean
 *                 default: false
 *                 description: Whether lists are locked for users
 *                 example: true
 *     responses:
 *       200:
 *         description: Board template created successfully
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
 */

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      allowNull: true,
    },
    isListsLocked: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!User.isAdminLevel(currentUser)) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['name', 'description', 'isListsLocked']);

    const boardTemplate = await BoardTemplate.create({
      ...values,
      createdByUserId: currentUser.id,
    }).fetch();

    return {
      item: boardTemplate,
    };
  },
};
