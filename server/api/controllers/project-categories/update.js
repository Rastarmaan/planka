/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

/**
 * @swagger
 * /project-categories/{id}:
 *   patch:
 *     summary: Update project category
 *     description: Updates a project category. Only admins can update categories.
 *     tags:
 *       - ProjectCategories
 *     operationId: updateProjectCategory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 description: Name of the category
 *                 example: Design
 *               description:
 *                 type: string
 *                 maxLength: 1024
 *                 nullable: true
 *                 description: Description of the category
 *                 example: Design-related projects
 *               color:
 *                 type: string
 *                 maxLength: 16
 *                 nullable: true
 *                 description: Color code for the category
 *                 example: "#FF5733"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/ProjectCategory'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
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
    name: {
      type: 'string',
      maxLength: 128,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1024,
      allowNull: true,
    },
    color: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 16,
      allowNull: true,
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

    const values = _.pick(inputs, ['name', 'description', 'color']);

    const updatedProjectCategory = await sails.helpers.projectCategories.updateOne.with({
      record: projectCategory,
      values,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: updatedProjectCategory,
    };
  },
};
