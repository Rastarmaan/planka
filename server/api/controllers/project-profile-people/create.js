/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

/**
 * @swagger
 * /api/projects/{projectId}/profile-people/{fieldId}:
 *   post:
 *     summary: Add a person to a profile field
 *     description: Adds a user with a role to a people-type profile field
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Person added successfully
 *       404:
 *         description: Project, field, or user not found
 *       409:
 *         description: User already assigned to this field
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
    userId: {
      ...idInput,
      required: true,
    },
    role: {
      type: 'string',
      defaultsTo: '',
    },
  },

  exits: {
    notFound: {
      responseType: 'notFound',
    },
    conflict: {
      responseType: 'conflict',
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

    if (!isProjectManager) {
      throw 'notFound';
    }

    const field = await ProjectProfileField.findOne({
      id: inputs.fieldId,
      isDeleted: false,
    });

    if (!field || field.fieldType !== 'people') {
      throw 'notFound';
    }

    const user = await User.findOne({
      id: inputs.userId,
      isDeactivated: false,
    });

    if (!user) {
      throw 'notFound';
    }

    const existing = await ProjectProfilePeople.findOne({
      project: project.id,
      field: inputs.fieldId,
      user: inputs.userId,
      isDeleted: false,
    });

    if (existing) {
      throw 'conflict';
    }

    const maxPositionRecord = await ProjectProfilePeople.find({
      project: project.id,
      field: inputs.fieldId,
      isDeleted: false,
    })
      .sort('position DESC')
      .limit(1);

    const position = maxPositionRecord.length > 0 ? maxPositionRecord[0].position + 1 : 0;

    const person = await ProjectProfilePeople.create({
      project: project.id,
      field: inputs.fieldId,
      user: inputs.userId,
      role: inputs.role,
      position,
    }).fetch();

    return {
      item: {
        id: person.id,
        userId: user.id,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
        role: person.role,
        position: person.position,
        fieldId: person.field,
        projectId: person.project,
      },
    };
  },
};
