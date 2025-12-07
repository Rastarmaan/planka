/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => ProjectTeam.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => ProjectTeam.create({ ...values }).fetch();

const getByProjectId = (projectId) => defaultFind({ projectId });

const getByTeamId = (teamId) => defaultFind({ teamId });

const getByProjectIds = (projectIds) => defaultFind({ projectId: projectIds });

const getOneById = (id) => ProjectTeam.findOne(id);

const getOneByProjectIdAndTeamId = (projectId, teamId) =>
  ProjectTeam.findOne({ projectId, teamId });

const deleteOne = (criteria) => ProjectTeam.destroyOne(criteria);

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => ProjectTeam.destroy(criteria).fetch();

module.exports = {
  createOne,
  getByProjectId,
  getByTeamId,
  getByProjectIds,
  getOneById,
  getOneByProjectIdAndTeamId,
  deleteOne,
  delete: delete_,
};
