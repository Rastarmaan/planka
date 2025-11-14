/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/releases/{id}:
 *   delete:
 *     summary: Delete a release
 *     description: Deletes an existing release. Only unreleased releases can be deleted.
 *     tags:
 *       - Project Releases
 *     operationId: deleteProjectRelease
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *         example: "1357158568008091264"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the release
 *         example: "1357158568008091265"
 *     responses:
 *       200:
 *         description: Release deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/ProjectRelease'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const project = await Project.findOne(inputs.projectId).populate('managerUsers');

    if (!project) {
      throw 'notFound';
    }

    const isProjectManager = project.managerUsers.some(
      (managerUser) => managerUser.id === currentUser.id,
    );

    if (!isProjectManager && currentUser.role !== User.Roles.ADMIN) {
      throw 'forbidden';
    }

    const release = await ProjectRelease.findOne({
      id: inputs.id,
      projectId: inputs.projectId,
    });

    if (!release) {
      throw 'notFound';
    }

    // Prevent deleting released releases
    if (release.status === ProjectRelease.Statuses.RELEASED) {
      throw {
        name: 'forbidden',
        message: 'Cannot delete released releases',
      };
    }

    // Check if release has any cards assigned
    const cardsCount = await Card.count({ releaseId: release.id });
    if (cardsCount > 0) {
      throw {
        name: 'forbidden',
        message: 'Cannot delete release that has cards assigned to it',
      };
    }

    await ProjectRelease.destroyOne({
      id: inputs.id,
      projectId: inputs.projectId,
    });

    return exits.success({
      item: release,
    });
  },
};
