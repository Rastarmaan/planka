/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

/**
 * @swagger
 * /project-categories/{id}:
 *   delete:
 *     summary: Delete project category
 *     description: Deletes a project category. Only admins can delete categories.
 *     tags:
 *       - ProjectCategories
 *     operationId: deleteProjectCategory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
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
 *       403:
 *         $ref: '#/components/responses/Forbidden'
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
    categoryNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const projectCategory = await ProjectCategory.findOne(inputs.id);

    if (!projectCategory) {
      throw Errors.CATEGORY_NOT_FOUND;
    }

    const deletedProjectCategory = await sails.helpers.projectCategories.deleteOne.with({
      record: projectCategory,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: deletedProjectCategory,
    };
  },
};
