/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => CardCalendarEvent.find(criteria).sort('id');

/* Query methods */

const create = (arrayOfValues) => CardCalendarEvent.createEach(arrayOfValues).fetch();

const createOne = (values) => CardCalendarEvent.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByCardId = (cardId) =>
  defaultFind({
    cardId,
  });

const getByCardIds = (cardIds) =>
  defaultFind({
    cardId: cardIds,
  });

const getOneByCardIdAndUserId = (cardId, userId) =>
  CardCalendarEvent.findOne({
    cardId,
    userId,
  });

const deleteMany = (criteria) => CardCalendarEvent.destroy(criteria).fetch();
const deleteOne = (criteria) => CardCalendarEvent.destroyOne(criteria);

module.exports = {
  create,
  createOne,
  getByIds,
  getByCardId,
  getByCardIds,
  getOneByCardIdAndUserId,
  deleteOne,
  delete: deleteMany,
};
