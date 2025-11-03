/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => CardDependency.find(criteria).sort('id');

/* Query methods */

const create = (arrayOfValues) => CardDependency.createEach(arrayOfValues).fetch();

const createOne = (values) => CardDependency.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByCardId = (cardId) =>
  defaultFind({
    cardId,
  });

const getByDependsOnCardId = (dependsOnCardId) =>
  defaultFind({
    dependsOnCardId,
  });

const getByCardIds = (cardIds) =>
  defaultFind({
    cardId: cardIds,
  });

const getByDependsOnCardIds = (dependsOnCardIds) =>
  defaultFind({
    dependsOnCardId: dependsOnCardIds,
  });

const getOneByCardIdAndDependsOnCardId = (cardId, dependsOnCardId) =>
  CardDependency.findOne({
    cardId,
    dependsOnCardId,
  });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => CardDependency.destroy(criteria).fetch();

const destroyOne = (criteria) => CardDependency.destroyOne(criteria);

module.exports = {
  create,
  createOne,
  getByIds,
  getByCardId,
  getByDependsOnCardId,
  getByCardIds,
  getByDependsOnCardIds,
  getOneByCardIdAndDependsOnCardId,
  destroyOne,
  delete: delete_,
};
