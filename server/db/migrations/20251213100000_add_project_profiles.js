/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Migration: Add Project Profiles (شناسنامه پروژه)
 *
 * This migration creates tables for managing project profiles/charters with dynamic sections and fields.
 * Admins can create profile templates and reuse them for multiple projects.
 *
 * Tables:
 * - project_profile: Main profile entity
 * - project_profile_section: Sections within a profile (team, social media, brief, etc.)
 * - project_profile_field: Dynamic fields within sections (text, textarea, image, url, etc.)
 */

exports.up = async (knex) => {
  // Create project_profile table
  await knex.schema.createTable('project_profile', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('name').notNullable();
    table.text('description').defaultTo('');

    // Link to project (optional - null if it's a template)
    table.bigInteger('project_id').references('id').inTable('project').onDelete('CASCADE');

    // Template system
    table.boolean('is_template').notNullable().defaultTo(false);
    table
      .bigInteger('template_id')
      .references('id')
      .inTable('project_profile')
      .onDelete('SET NULL');

    // Soft delete support
    table.boolean('is_deleted').notNullable().defaultTo(false);

    // Timestamps
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true });

    // Indexes
    table.index('project_id');
    table.index('is_template');
    table.index('template_id');
    table.index('is_deleted');
    table.index('created_at');
  });

  // Create project_profile_section table
  await knex.schema.createTable('project_profile_section', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table
      .bigInteger('profile_id')
      .notNullable()
      .references('id')
      .inTable('project_profile')
      .onDelete('CASCADE');

    table.text('name').notNullable();
    table.text('type').notNullable().defaultTo('custom'); // team, social_media, brief, logo, custom
    table.text('description').defaultTo('');

    // Order for sorting sections
    table.float('position').notNullable();

    // Soft delete support
    table.boolean('is_deleted').notNullable().defaultTo(false);

    // Timestamps
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true });

    // Indexes
    table.index('profile_id');
    table.index('is_deleted');
    table.index('position');
  });

  // Create project_profile_field table
  await knex.schema.createTable('project_profile_field', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table
      .bigInteger('section_id')
      .notNullable()
      .references('id')
      .inTable('project_profile_section')
      .onDelete('CASCADE');

    // Field type: text, textarea, email, url, image, date, select, checkbox
    table.text('field_type').notNullable().defaultTo('text');

    // Field label and value
    table.text('label').notNullable();
    table.text('value').defaultTo('');

    // Additional metadata (JSON) for field configuration
    // e.g., { placeholder: "...", options: [...], required: true }
    table.jsonb('metadata').defaultTo('{}');

    // Order for sorting fields
    table.float('position').notNullable();

    // Soft delete support
    table.boolean('is_deleted').notNullable().defaultTo(false);

    // Timestamps
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true });

    // Indexes
    table.index('section_id');
    table.index('field_type');
    table.index('is_deleted');
    table.index('position');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('project_profile_field');
  await knex.schema.dropTableIfExists('project_profile_section');
  await knex.schema.dropTableIfExists('project_profile');
};
