/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/releases:
 *   get:
 *     summary: Get all releases for a project
 *     description: Retrieves all releases for a specific project that the current user has access to.
 *     tags:
 *       - Project Releases
 *     operationId: getProjectReleases
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *         example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Project releases retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - items
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/ProjectRelease'
 *                       - type: object
 *                         properties:
 *                           cardsTotal:
 *                             type: number
 *                             description: Total number of cards in this release
 *                             example: 15
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
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

    const releases = await ProjectRelease.find({
      projectId: inputs.projectId,
    }).sort('createdAt DESC');

    // Get cards count for each release
    const releasesWithCounts = await Promise.all(
      releases.map(async (release) => {
        const cardsTotal = await Card.count({ releaseId: release.id });
        return {
          ...release,
          cardsTotal,
        };
      }),
    );

    return exits.success({
      items: releasesWithCounts,
    });
  },
};
