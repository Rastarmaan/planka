/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria, { sort = 'id' } = {}) => TaskCalendarEvent.find(criteria).sort(sort);

/* Query methods */

const getOneByTaskId = (taskId) =>
  defaultFind({ taskId })
    .limit(1)
    .then((items) => items[0]);

const getOneByEventId = (eventId) =>
  defaultFind({ eventId })
    .limit(1)
    .then((items) => items[0]);

const createOne = (values) => TaskCalendarEvent.create({ ...values }).fetch();

const updateOne = (id, values) => TaskCalendarEvent.updateOne(id, { ...values }).fetch();

const deleteOne = (id) => TaskCalendarEvent.destroyOne(id);

const deleteMany = (criteria) => TaskCalendarEvent.destroy(criteria);

module.exports = {
  getOneByTaskId,
  getOneByEventId,
  createOne,
  updateOne,
  deleteOne,
  deleteMany,
};
