/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = async function canEditFile(req, res, proceed) {
  if (req.currentUser.role === 'admin') {
    return proceed();
  }

  const fileId = req.params.id;
  if (!fileId) {
    return res.badRequest('File ID is required');
  }

  const hasPermission = await sails.helpers.permissions.checkPermission.with({
    userId: req.currentUser.id,
    resourceType: 'file',
    resourceId: fileId,
    permissionType: 'canEdit',
  });

  if (hasPermission) {
    return proceed();
  }

  return res.notFound();
};
