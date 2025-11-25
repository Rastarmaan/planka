/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const updateChildPaths = async (parentId, oldParentPath, newParentPath) => {
  const childFolders = await DocumentFolder.find({ parentFolder: parentId, isDeleted: false });

  /* eslint-disable no-await-in-loop, no-restricted-syntax */
  for (const child of childFolders) {
    const newChildPath = child.path.replace(oldParentPath, newParentPath);
    await DocumentFolder.updateOne({ id: child.id }).set({ path: newChildPath });

    await updateChildPaths(child.id, child.path, newChildPath);
  }
  /* eslint-enable no-await-in-loop, no-restricted-syntax */
};

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
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
    const { record, values } = inputs;
    const updateData = {};

    if (values.name !== undefined) {
      updateData.name = values.name;
    }

    if (values.parentFolderId !== undefined) {
      updateData.parentFolder = values.parentFolderId || null;
    }

    if (updateData.name || updateData.parentFolder !== undefined) {
      const newName = updateData.name || record.name;
      let newPath = `/${newName}`;

      const newParentId =
        updateData.parentFolder !== undefined ? updateData.parentFolder : record.parentFolder;

      if (newParentId) {
        const parentFolder = await DocumentFolder.findOne({ id: newParentId });
        if (parentFolder) {
          newPath = `${parentFolder.path}/${newName}`;
        }
      }

      updateData.path = newPath;
    }

    const updatedFolder = await DocumentFolder.updateOne({ id: record.id }).set(updateData);

    if (!updatedFolder) {
      throw new Error('Folder not found');
    }

    if (updateData.path && updateData.path !== record.path) {
      await updateChildPaths(record.id, record.path, updateData.path);
    }

    sails.sockets.broadcast(`space:${record.space}`, 'folderUpdate', {
      item: updatedFolder,
    });

    await sails.helpers.documentActivity.logOne.with({
      user: inputs.user,
      action: 'update',
      resourceType: 'folder',
      resourceId: updatedFolder.id,
      resourceName: updatedFolder.name,
      metadata: {
        changes: values,
      },
      request: inputs.request,
    });

    return updatedFolder;
  },
};
