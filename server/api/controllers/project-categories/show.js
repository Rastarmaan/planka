/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

/**
 * @swagger
 * /project-categories/{id}:
 *   get:
 *     summary: Get project category
 *     description: Retrieves a specific project category by ID.
 *     tags:
 *       - ProjectCategories
 *     operationId: getProjectCategory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/ProjectCategory'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const Errors = {
  CATEGORY_NOT_FOUND: {
    categoryNotFound: 'Category not found',
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
    categoryNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser) {
      throw 'notEnoughRights';
    }

    const projectCategory = await ProjectCategory.findOne(inputs.id);

    if (!projectCategory) {
      throw Errors.CATEGORY_NOT_FOUND;
    }

    return {
      item: projectCategory,
    };
  },
};
