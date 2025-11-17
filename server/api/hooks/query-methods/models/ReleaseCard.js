/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => ReleaseCard.find(criteria).sort('id');

/* Query methods */

const create = (arrayOfValues) => ReleaseCard.createEach(arrayOfValues).fetch();

const createOne = (values) => ReleaseCard.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByReleaseId = (releaseId) =>
  defaultFind({
    releaseId,
  });

const getByCardId = (cardId) =>
  defaultFind({
    cardId,
  });

const getByCardIds = (cardIds) =>
  defaultFind({
    cardId: cardIds,
  });

const getByReleaseIds = (releaseIds) =>
  defaultFind({
    releaseId: releaseIds,
  });

const getOneByReleaseIdAndCardId = (releaseId, cardId) =>
  ReleaseCard.findOne({
    releaseId,
    cardId,
  });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => ReleaseCard.destroy(criteria).fetch();

const deleteOne = (criteria) => ReleaseCard.destroyOne(criteria);

module.exports = {
  create,
  createOne,
  getByIds,
  getByReleaseId,
  getByCardId,
  getByCardIds,
  getByReleaseIds,
  getOneByReleaseIdAndCardId,
  deleteOne,
  delete: delete_,
};
