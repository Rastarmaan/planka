/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * ReportPhaseMembership.js
 *
 * @description :: Model for user memberships in report phases with permissions
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Permissions = {
  VIEW: 'view',
  EDIT: 'edit',
};

module.exports = {
  Permissions,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    permission: {
      type: 'string',
      isIn: Object.values(Permissions),
      defaultsTo: Permissions.VIEW,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    phase: {
      model: 'ReportPhase',
      required: true,
      columnName: 'phase_id',
    },

    user: {
      model: 'User',
      required: true,
      columnName: 'user_id',
    },
  },

  tableName: 'report_phase_membership',

  customToJSON() {
    return this;
  },
};
