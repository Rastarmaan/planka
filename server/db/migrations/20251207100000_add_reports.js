/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Migration: Add Reports and Report Phases
 *
 * This migration creates tables for managing project reports and their phases.
 * Reports can track project stages/phases with timeline management and status tracking.
 *
 * Tables:
 * - report: Main report entity with name and metadata
 * - report_phase: Individual phases within a report with status, dates, and description
 */

exports.up = async (knex) => {
  // Create report table
  await knex.schema.createTable('report', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('name').notNullable();

    // Soft delete support
    table.boolean('is_deleted').notNullable().defaultTo(false);

    // Timestamps
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true });

    // Indexes
    table.index('is_deleted');
    table.index('created_at');
  });

  // Create report_phase table
  await knex.schema.createTable('report_phase', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table
      .bigInteger('report_id')
      .notNullable()
      .references('id')
      .inTable('report')
      .onDelete('CASCADE');

    table.text('name').notNullable();
    table.text('description').defaultTo('');

    // Timeline
    table.date('start_date');
    table.date('end_date');

    // Status: 'todo', 'doing', 'done'
    table.text('status').notNullable().defaultTo('todo');

    // Order for sorting phases
    table.float('position').notNullable();

    // Soft delete support
    table.boolean('is_deleted').notNullable().defaultTo(false);

    // Timestamps
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true });

    // Indexes
    table.index('report_id');
    table.index(['report_id', 'position']);
    table.index('is_deleted');
  });

  return Promise.resolve();
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('report_phase');
  await knex.schema.dropTableIfExists('report');
};
