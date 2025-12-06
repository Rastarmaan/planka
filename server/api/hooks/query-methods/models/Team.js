/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => Team.find(criteria).sort('name');

/* Query methods */

const createOne = (values) => Team.create({ ...values }).fetch();

const getAll = () => defaultFind({});

const getByIds = (ids) => defaultFind(ids);

const getOneById = (id) => Team.findOne(id);

const updateOne = (criteria, values) => Team.updateOne(criteria).set({ ...values });

const deleteOne = (criteria) => Team.destroyOne(criteria);

module.exports = {
  createOne,
  getAll,
  getByIds,
  getOneById,
  updateOne,
  deleteOne,
};
