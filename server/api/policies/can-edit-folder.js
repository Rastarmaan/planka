/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = async function canEditFolder(req, res, proceed) {
  if (req.currentUser.role === 'admin') {
    return proceed();
  }

  const folderId = req.params.id;
  if (!folderId) {
    return res.badRequest('Folder ID is required');
  }

  const hasPermission = await sails.helpers.permissions.checkPermission.with({
    userId: req.currentUser.id,
    resourceType: 'folder',
    resourceId: folderId,
    permissionType: 'canEdit',
  });

  if (hasPermission) {
    return proceed();
  }

  return res.notFound();
};
