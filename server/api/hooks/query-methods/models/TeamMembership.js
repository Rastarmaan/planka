/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => TeamMembership.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => TeamMembership.create({ ...values }).fetch();

const getByTeamId = (teamId) => defaultFind({ teamId });

const getByUserId = (userId) => defaultFind({ userId });

const getByTeamIds = (teamIds) => defaultFind({ teamId: teamIds });

const getOneById = (id) => TeamMembership.findOne(id);

const getOneByTeamIdAndUserId = (teamId, userId) => TeamMembership.findOne({ teamId, userId });

const deleteOne = (criteria) => TeamMembership.destroyOne(criteria);

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => TeamMembership.destroy(criteria).fetch();

module.exports = {
  createOne,
  getByTeamId,
  getByUserId,
  getByTeamIds,
  getOneById,
  getOneByTeamIdAndUserId,
  deleteOne,
  delete: delete_,
};
