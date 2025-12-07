/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => BoardTeam.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => BoardTeam.create({ ...values }).fetch();

const getByBoardId = (boardId) => defaultFind({ boardId });

const getByTeamId = (teamId) => defaultFind({ teamId });

const getByBoardIds = (boardIds) => defaultFind({ boardId: boardIds });

const getOneById = (id) => BoardTeam.findOne(id);

const getOneByBoardIdAndTeamId = (boardId, teamId) => BoardTeam.findOne({ boardId, teamId });

const updateOne = (criteria, values) => BoardTeam.updateOne(criteria).set({ ...values });

const deleteOne = (criteria) => BoardTeam.destroyOne(criteria);

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => BoardTeam.destroy(criteria).fetch();

module.exports = {
  createOne,
  getByBoardId,
  getByTeamId,
  getByBoardIds,
  getOneById,
  getOneByBoardIdAndTeamId,
  updateOne,
  deleteOne,
  delete: delete_,
};
