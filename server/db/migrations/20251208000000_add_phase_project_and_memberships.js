/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Migration: Add Project Assignment and User Memberships to Report Phases
 *
 * This migration adds:
 * 1. Project assignment to report phases
 * 2. User memberships with view/edit permissions for phases
 */

exports.up = async (knex) => {
  // Add project_id to report_phase table
  await knex.schema.table('report_phase', (table) => {
    table.bigInteger('project_id').references('id').inTable('project').onDelete('CASCADE');

    table.index('project_id');
  });

  // Create report_phase_membership table
  await knex.schema.createTable('report_phase_membership', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table
      .bigInteger('phase_id')
      .notNullable()
      .references('id')
      .inTable('report_phase')
      .onDelete('CASCADE');

    table
      .bigInteger('user_id')
      .notNullable()
      .references('id')
      .inTable('user_account')
      .onDelete('CASCADE');

    // Permission: 'view' or 'edit'
    table.text('permission').notNullable().defaultTo('view');

    // Timestamps
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true });

    // Indexes
    table.index('phase_id');
    table.index('user_id');
    table.unique(['phase_id', 'user_id']); // One user can have only one permission per phase
  });

  return Promise.resolve();
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('report_phase_membership');

  await knex.schema.table('report_phase', (table) => {
    table.dropColumn('project_id');
  });
};
