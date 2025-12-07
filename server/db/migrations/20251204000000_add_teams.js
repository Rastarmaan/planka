/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Migration to add Teams functionality
 * - Team: A named group of users
 * - TeamMembership: Links users to teams
 * - ProjectTeam: Links teams to projects (all team members get project access)
 * - BoardTeam: Links teams to boards with role-based access
 */

exports.up = async (knex) => {
  // Create team table
  await knex.schema.createTable('team', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.string('name', 255).notNullable();
    table.text('description');

    table.bigInteger('creator_user_id');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('name');
    table.index('creator_user_id');

    /* Foreign keys */

    table
      .foreign('creator_user_id')
      .references('user_account.id')
      .onDelete('SET NULL')
      .onUpdate('CASCADE');
  });

  // Create team_membership table (users belonging to teams)
  await knex.schema.createTable('team_membership', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('team_id').notNullable();
    table.bigInteger('user_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('team_id');
    table.index('user_id');
    table.unique(['team_id', 'user_id']);

    /* Foreign keys */

    table.foreign('team_id').references('team.id').onDelete('CASCADE').onUpdate('CASCADE');
    table.foreign('user_id').references('user_account.id').onDelete('CASCADE').onUpdate('CASCADE');
  });

  // Create project_team table (teams assigned to projects)
  await knex.schema.createTable('project_team', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('project_id').notNullable();
    table.bigInteger('team_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('project_id');
    table.index('team_id');
    table.unique(['project_id', 'team_id']);

    /* Foreign keys */

    table.foreign('project_id').references('project.id').onDelete('CASCADE').onUpdate('CASCADE');
    table.foreign('team_id').references('team.id').onDelete('CASCADE').onUpdate('CASCADE');
  });

  // Create board_team table (teams assigned to boards with role)
  await knex.schema.createTable('board_team', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('board_id').notNullable();
    table.bigInteger('team_id').notNullable();

    // Role: 'editor' or 'viewer' (same as board membership roles)
    table.string('role', 50).notNullable().defaultTo('editor');

    table.boolean('can_comment').defaultTo(true);

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('board_id');
    table.index('team_id');
    table.unique(['board_id', 'team_id']);

    /* Foreign keys */

    table.foreign('board_id').references('board.id').onDelete('CASCADE').onUpdate('CASCADE');
    table.foreign('team_id').references('team.id').onDelete('CASCADE').onUpdate('CASCADE');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('board_team');
  await knex.schema.dropTableIfExists('project_team');
  await knex.schema.dropTableIfExists('team_membership');
  await knex.schema.dropTableIfExists('team');
};
