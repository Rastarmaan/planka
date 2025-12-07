/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * ReportPhase.js
 *
 * @description :: Model for report phases/stages
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Statuses = {
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
};

module.exports = {
  Statuses,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      defaultsTo: '',
    },
    startDate: {
      type: 'ref',
      columnName: 'start_date',
    },
    endDate: {
      type: 'ref',
      columnName: 'end_date',
    },
    status: {
      type: 'string',
      isIn: Object.values(Statuses),
      defaultsTo: Statuses.TODO,
    },
    position: {
      type: 'number',
      required: true,
    },
    isDeleted: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_deleted',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    report: {
      model: 'Report',
      required: true,
      columnName: 'report_id',
    },
  },

  tableName: 'report_phase',

  customToJSON() {
    return this;
  },
};
