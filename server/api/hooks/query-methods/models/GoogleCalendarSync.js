/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria, { sort = 'id' } = {}) =>
  GoogleCalendarSync.find(criteria).sort(sort);

/* Query methods */

const getOneByUserId = (userId) =>
  defaultFind({ userId })
    .limit(1)
    .then((items) => items[0]);

const getOneById = (id) => GoogleCalendarSync.findOne({ id });

const createOne = (values) => GoogleCalendarSync.create({ ...values }).fetch();

const updateOne = (id, values) => GoogleCalendarSync.updateOne(id, { ...values }).fetch();

const deleteOne = (id) => GoogleCalendarSync.destroyOne(id);

module.exports = {
  getOneByUserId,
  getOneById,
  createOne,
  updateOne,
  deleteOne,
};
