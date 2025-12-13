/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const field = await ProjectProfileField.create(inputs.values).fetch();

    // Broadcast to all admin/manager users
    const adminUsers = await User.find({
      or: [{ role: User.Roles.ADMIN }, { role: User.Roles.MANAGER }],
    });

    adminUsers.forEach((user) => {
      sails.sockets.broadcast(
        `user:${user.id}`,
        'projectProfileFieldCreate',
        {
          item: {
            ...field,
            sectionId: field.section,
          },
        },
        inputs.request,
      );
    });

    return {
      ...field,
      sectionId: field.section,
    };
  },
};
