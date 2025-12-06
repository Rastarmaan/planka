/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Get all teams
 *     description: Returns all teams the current user has access to.
 *     tags:
 *       - Teams
 *     operationId: getTeams
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
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
 *                     $ref: '#/components/schemas/Team'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

module.exports = {
  async fn() {
    const { currentUser } = this.req;

    let teams;
    let teamMemberships = [];

    if (currentUser.role === User.Roles.ADMIN) {
      teams = await Team.qm.getAll();
      if (teams.length > 0) {
        const teamIds = teams.map((t) => t.id);
        teamMemberships = await TeamMembership.find({ teamId: teamIds });
      }
    } else {
      const userMemberships = await TeamMembership.qm.getByUserId(currentUser.id);
      const teamIds = userMemberships.map((tm) => tm.teamId);
      teams = await Team.find({ id: teamIds });
      if (teamIds.length > 0) {
        teamMemberships = await TeamMembership.find({ teamId: teamIds });
      }
    }

    const teamsWithMemberCount = teams.map((team) => ({
      ...team,
      memberCount: teamMemberships.filter((tm) => tm.teamId === team.id).length,
    }));

    return {
      items: teamsWithMemberCount,
      included: {
        teamMemberships,
      },
    };
  },
};
