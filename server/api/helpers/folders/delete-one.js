/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Recursively get all child folder IDs
 */
async function getAllChildFolderIds(parentId) {
  const childFolders = await DocumentFolder.find({
    parentFolder: parentId,
    isDeleted: false,
  });

  let allIds = childFolders.map((f) => f.id);

  /* eslint-disable no-await-in-loop, no-restricted-syntax */
  for (const child of childFolders) {
    const descendantIds = await getAllChildFolderIds(child.id);
    allIds = allIds.concat(descendantIds);
  }
  /* eslint-enable no-await-in-loop, no-restricted-syntax */

  return allIds;
}

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { record } = inputs;

    const childFolderIds = await getAllChildFolderIds(record.id);

    await DocumentFolder.updateOne({ id: record.id }).set({
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedByUser: inputs.user.id,
    });

    if (childFolderIds.length > 0) {
      await DocumentFolder.update({ id: { in: childFolderIds }, isDeleted: false }).set({
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedByUser: inputs.user.id,
      });
    }

    const folderIdsToDelete = [record.id, ...childFolderIds];
    await DocumentFile.update({ folder: { in: folderIdsToDelete }, isDeleted: false }).set({
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedByUser: inputs.user.id,
    });

    sails.sockets.broadcast(`space:${record.space}`, 'folderDelete', {
      item: {
        id: record.id,
      },
    });

    await sails.helpers.documentActivity.logOne.with({
      user: inputs.user,
      action: 'delete',
      resourceType: 'folder',
      resourceId: record.id,
      resourceName: record.name,
      request: inputs.request,
    });

    return record;
  },
};
