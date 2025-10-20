/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria, { sort = 'createdAt DESC' } = {}) =>
  ProjectVersion.find(criteria).sort(sort);

/* Query methods */

const createOne = (values) => ProjectVersion.create(values).fetch();

const getByIds = (ids, options) => defaultFind({ id: { in: ids } }, options);

const getByProjectId = (projectId, options) => defaultFind({ projectId }, options);

const getOneById = (id) => ProjectVersion.findOne(id);

const updateOne = (criteria, values) => ProjectVersion.updateOne(criteria).set(values);

const deleteOne = (criteria) => ProjectVersion.destroyOne(criteria);

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => ProjectVersion.destroy(criteria).fetch();

module.exports = {
  createOne,
  getByIds,
  getByProjectId,
  getOneById,
  updateOne,
  deleteOne,
  delete: delete_,
};
