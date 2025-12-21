/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

/**
 * @swagger
 * /api/projects/{projectId}/profile-people/{fieldId}:
 *   get:
 *     summary: Get people assigned to a profile field
 *     description: Retrieves all users assigned to a people-type profile field for a project
 *     tags:
 *       - Project Profile People
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: People retrieved successfully
 *       404:
 *         description: Project or field not found
 */
module.exports = {
  inputs: {
    projectId: {
      ...idInput,
      required: true,
    },
    fieldId: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    notFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.findOne({
      id: inputs.projectId,
    });

    if (!project) {
      throw 'notFound';
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);
    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, project.id);

    if (!isProjectManager && !isBoardMember) {
      throw 'notFound';
    }

    const field = await ProjectProfileField.findOne({
      id: inputs.fieldId,
      isDeleted: false,
    });

    if (!field || field.fieldType !== 'people') {
      throw 'notFound';
    }

    const people = await ProjectProfilePeople.find({
      project: project.id,
      field: inputs.fieldId,
      isDeleted: false,
    })
      .sort('position ASC')
      .populate('user');

    return {
      items: people.map((p) => ({
        id: p.id,
        userId: p.user ? p.user.id : null,
        user: p.user
          ? {
              id: p.user.id,
              name: p.user.name,
              username: p.user.username,
              email: p.user.email,
              avatarUrl: p.user.avatarUrl,
            }
          : null,
        role: p.role,
        position: p.position,
        fieldId: p.field,
        projectId: p.project,
      })),
    };
  },
};
