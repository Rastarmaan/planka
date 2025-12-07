/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/releases/{id}/status:
 *   patch:
 *     summary: Update release status
 *     description: Updates the status of a release (e.g., from unreleased to released).
 *     tags:
 *       - Project Releases
 *     operationId: updateProjectReleaseStatus
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [unreleased, released]
 *                 description: New status for the release
 *                 example: "released"
 *     responses:
 *       200:
 *         description: Release status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/ProjectRelease'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
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
    status: {
      type: 'string',
      isIn: Object.values(ProjectRelease.Statuses),
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

    if (!isProjectManager && !User.isAdminLevel(currentUser)) {
      throw 'forbidden';
    }

    const release = await ProjectRelease.findOne({
      id: inputs.id,
      projectId: inputs.projectId,
    });

    if (!release) {
      throw 'notFound';
    }

    // Prevent changing status from released back to unreleased
    if (
      release.status === ProjectRelease.Statuses.RELEASED &&
      inputs.status === ProjectRelease.Statuses.UNRELEASED
    ) {
      throw {
        name: 'forbidden',
        message: 'Cannot change released release back to unreleased',
      };
    }

    const values = { status: inputs.status };

    // Set releasedAt when marking as released
    if (inputs.status === ProjectRelease.Statuses.RELEASED) {
      values.releasedAt = new Date();
    }

    const updatedRelease = await ProjectRelease.updateOne({
      id: inputs.id,
      projectId: inputs.projectId,
    }).set(values);

    return exits.success({
      item: updatedRelease,
    });
  },
};
