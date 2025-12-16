/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const profile = await ProjectProfile.updateOne(inputs.record.id).set(inputs.values);

    if (!profile) {
      return profile;
    }

    // Broadcast to all admin/manager users
    const adminUsers = await User.find({
      or: [{ role: User.Roles.ADMIN }, { role: User.Roles.MANAGER }],
    });

    adminUsers.forEach((user) => {
      sails.sockets.broadcast(
        `user:${user.id}`,
        'projectProfileUpdate',
        {
          item: {
            ...profile,
            projectId: profile.project || null,
            templateId: profile.template || null,
          },
        },
        inputs.request,
      );
    });

    return {
      ...profile,
      projectId: profile.project || null,
      templateId: profile.template || null,
    };
  },
};
