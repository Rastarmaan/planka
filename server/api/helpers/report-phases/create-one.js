/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
      type: 'json',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { memberships, ...phaseValues } = inputs.values;

    const phase = await ReportPhase.create(phaseValues).fetch();

    if (memberships && Array.isArray(memberships) && memberships.length > 0) {
      await Promise.all(
        memberships.map((membership) =>
          ReportPhaseMembership.create({
            phase: phase.id,
            user: membership.userId,
            permission: membership.permission || 'view',
          }),
        ),
      );
    }

    const phaseWithRelations = await ReportPhase.findOne({ id: phase.id }).populate(
      'phaseMemberships',
    );

    const phaseData = {
      ...phaseWithRelations,
      reportId: phaseWithRelations.report,
      projectId: phaseWithRelations.project || null,
    };

    const reportPhaseMemberships = phaseWithRelations.phaseMemberships.map((membership) => ({
      id: membership.id,
      phaseId: phase.id,
      userId: membership.user,
      permission: membership.permission,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));

    const adminUsers = await User.find({
      or: [{ role: User.Roles.ADMIN }, { role: User.Roles.MANAGER }],
    });

    adminUsers.forEach((user) => {
      sails.sockets.broadcast(
        `user:${user.id}`,
        'reportPhaseCreate',
        {
          item: phaseData,
          reportPhaseMemberships,
        },
        inputs.request,
      );
    });

    return {
      phase: phaseData,
      reportPhaseMemberships,
    };
  },
};
