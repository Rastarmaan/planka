/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = async function isAdminOrManager(req, res, proceed) {
  if (!req.currentUser || !['admin', 'manager'].includes(req.currentUser.role)) {
    return res.notFound();
  }

  return proceed();
};
