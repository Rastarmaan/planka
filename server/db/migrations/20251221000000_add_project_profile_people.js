/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Migration: Add Project Profile People
 *
 * This migration creates the project_profile_people table for storing
 * user selections with roles in project profile people fields.
 * Each record represents a user assigned to a field with a specific role.
 */

exports.up = async (knex) => {
  await knex.schema.createTable('project_profile_people', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    // Reference to the project
    table.bigInteger('project_id').notNullable();

    // Reference to the profile field (must be of type 'people')
    table.bigInteger('field_id').notNullable();

    // Reference to the selected user
    table.bigInteger('user_id').notNullable();

    // Role of the user in this field (e.g., "Manager", "Designer", "Developer")
    table.text('role').notNullable().defaultTo('');

    // Order for sorting people within the field
    table.float('position').notNullable().defaultTo(0);

    // Soft delete support
    table.boolean('is_deleted').notNullable().defaultTo(false);

    // Timestamps
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true });

    // Indexes
    table.index('project_id');
    table.index('field_id');
    table.index('user_id');
    table.index('is_deleted');
    table.index('position');

    // Foreign keys
    table.foreign('project_id').references('project.id').onDelete('CASCADE');
    table.foreign('field_id').references('project_profile_field.id').onDelete('CASCADE');
    table.foreign('user_id').references('user_account.id').onDelete('CASCADE');

    // Unique constraint to prevent duplicate user assignments in the same field for a project
    table.unique(['project_id', 'field_id', 'user_id']);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('project_profile_people');
};

module.exports.config = { transaction: false };
