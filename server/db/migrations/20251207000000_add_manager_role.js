/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Migration to add MANAGER role
 * - Manager role is side-by-side with Admin with same access level
 */

exports.up = async () => {
  // Note: PostgreSQL doesn't have enum types in this codebase
  // The role column is a text field with application-level validation
  // No schema changes needed - the new 'manager' value will be validated by the model

  // This migration serves as documentation that the MANAGER role was added
  // and can be used for data migration if needed in the future

  return Promise.resolve();
};

exports.down = async (knex) => {
  // Remove manager role from any users (downgrade to projectOwner)
  await knex('user_account').where('role', 'manager').update({ role: 'projectOwner' });

  return Promise.resolve();
};
