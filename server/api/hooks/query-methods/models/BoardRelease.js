/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria, { sort = 'id' } = {}) => BoardRelease.find(criteria).sort(sort);

/* Query methods */

const createOne = (values) => BoardRelease.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind({ id: ids });

const getByBoardId = (boardId, { sort = ['version', 'id'] } = {}) => {
  const criteria = {
    boardId,
  };

  return defaultFind(criteria, { sort });
};

const getOneById = (id) => BoardRelease.findOne({ id });

const updateOne = (criteria, values) =>
  BoardRelease.updateOne(criteria)
    .set(values)
    .intercept('E_UNIQUE', () => 'versionAlreadyExists');

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => BoardRelease.destroy(criteria).fetch();

const deleteOne = (criteria) => BoardRelease.destroyOne(criteria);

module.exports = {
  createOne,
  getByIds,
  getByBoardId,
  getOneById,
  updateOne,
  deleteOne,
  delete: delete_,
};
