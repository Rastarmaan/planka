/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {
  /**
   *
   * Default policy for all controllers and actions, unless overridden.
   * (`true` allows public access)
   *
   */

  '*': ['is-authenticated', 'is-external'],

  'webhooks/index': ['is-authenticated', 'is-external', 'is-admin'],
  'webhooks/create': ['is-authenticated', 'is-external', 'is-admin'],
  'webhooks/update': ['is-authenticated', 'is-external', 'is-admin'],
  'webhooks/delete': ['is-authenticated', 'is-external', 'is-admin'],

  'users/index': 'is-authenticated',
  'users/create': ['is-authenticated', 'is-admin'],
  'users/show': 'is-authenticated',
  'users/update': 'is-authenticated',
  'users/update-email': 'is-authenticated',
  'users/update-password': 'is-authenticated',
  'users/update-username': 'is-authenticated',
  'users/update-avatar': 'is-authenticated',
  'users/delete': ['is-authenticated', 'is-admin'],

  'projects/create': ['is-authenticated', 'is-external', 'is-admin-or-project-owner'],

  'project-categories/index': 'is-authenticated',
  'project-categories/show': 'is-authenticated',
  'project-categories/create': ['is-authenticated', 'is-external', 'is-admin'],
  'project-categories/update': ['is-authenticated', 'is-external', 'is-admin'],
  'project-categories/delete': ['is-authenticated', 'is-external', 'is-admin'],

  'spaces/index': ['is-authenticated', 'is-external'],
  'spaces/create': ['is-authenticated', 'is-external', 'is-admin'],
  'spaces/show': ['is-authenticated', 'is-external'],
  'spaces/update': ['is-authenticated', 'is-external', 'is-admin'],
  'spaces/delete': ['is-authenticated', 'is-external', 'is-admin'],

  'folders/index': ['is-authenticated', 'is-external'],
  'folders/create': ['is-authenticated', 'is-external', 'is-admin'],
  'folders/show': ['is-authenticated', 'is-external'],
  'folders/update': ['is-authenticated', 'is-external', 'is-admin'],
  'folders/delete': ['is-authenticated', 'is-external', 'is-admin'],

  'document-files/upload': ['is-authenticated', 'is-external', 'is-admin'],
  'document-files/show': ['is-authenticated', 'is-external'],
  'document-files/download': ['is-authenticated', 'is-external'],
  'document-files/update': ['is-authenticated', 'is-external', 'is-admin'],
  'document-files/delete': ['is-authenticated', 'is-external', 'is-admin'],

  'share-links/create': ['is-authenticated', 'is-external', 'is-admin'],
  'share-links/index': ['is-authenticated', 'is-external', 'is-admin'],
  'share-links/delete': ['is-authenticated', 'is-external', 'is-admin'],
  'share-links/access': true,
  'share-links/download': true,

  'permissions/create': ['is-authenticated', 'is-external', 'is-admin'],
  'permissions/index': ['is-authenticated', 'is-external'],
  'permissions/delete': ['is-authenticated', 'is-external', 'is-admin'],
  'permissions/my-permissions': ['is-authenticated', 'is-external'],

  'config/show': true,
  'terms/show': true,
  'access-tokens/create': true,
  'access-tokens/exchange-with-oidc': true,
  'access-tokens/accept-terms': true,
  'access-tokens/revoke-pending-token': true,

  'google-calendar/authorize': 'is-authenticated',
  'google-calendar/callback': true,
  'google-calendar/status': 'is-authenticated',
  'google-calendar/disconnect': 'is-authenticated',
  'google-calendar/toggle': 'is-authenticated',
};
