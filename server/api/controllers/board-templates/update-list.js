/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /board-templates/{id}/lists/{listId}:
 *   patch:
 *     summary: Update template list
 *     description: Updates a list in a board template. Requires admin permissions.
 *     tags:
 *       - Board Templates
 *     operationId: updateTemplateList
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the board template
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: listId
 *         in: path
 *         required: true
 *         description: ID of the list
 *         schema:
 *           type: string
 *           example: "1357158568008091265"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the list
 *                 example: In Progress
 *               position:
 *                 type: number
 *                 description: Position of the list
 *                 example: 131072
 *     responses:
 *       200:
 *         description: List updated successfully
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
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    listId: {
      ...idInput,
      required: true,
    },
    name: {
      type: 'string',
    },
    position: {
      type: 'number',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!User.isAdminLevel(currentUser)) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const list = await BoardTemplateList.findOne({
      id: inputs.listId,
      boardTemplateId: inputs.id,
    });

    if (!list) {
      throw Errors.LIST_NOT_FOUND;
    }

    const values = _.pick(inputs, ['name', 'position']);

    const updatedList = await BoardTemplateList.updateOne({ id: inputs.listId }).set(values);

    return {
      item: updatedList,
    };
  },
};
