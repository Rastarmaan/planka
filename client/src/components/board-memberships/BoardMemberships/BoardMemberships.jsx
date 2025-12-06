/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import groupBy from 'lodash/groupBy';
import React, { useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'semantic-ui-react';
import { usePopup } from '../../../lib/popup';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { isUserAdminOrProjectOwner } from '../../../utils/record-helpers';
import { BoardMembershipRoles } from '../../../constants/Enums';
import Group from './Group';
import TeamGroup from './TeamGroup';
import AddStep from './AddStep';
import AddTeamStep from './AddTeamStep';

import styles from './BoardMemberships.module.scss';

const BoardMemberships = React.memo(() => {
  const dispatch = useDispatch();
  const boardId = useSelector((state) => selectors.selectPath(state).boardId);
  const boardMemberships = useSelector(selectors.selectMembershipsForCurrentBoard);
  const boardTeams = useSelector(selectors.selectBoardTeamsForCurrentBoard);

  useEffect(() => {
    if (boardId) {
      dispatch(entryActions.fetchBoardTeams(boardId));
    }
  }, [dispatch, boardId]);

  const canAdd = useSelector((state) => {
    const user = selectors.selectCurrentUser(state);

    if (!isUserAdminOrProjectOwner(user)) {
      return !selectors.selectCurrentUserMembershipForCurrentBoard(state);
    }

    return selectors.selectIsCurrentUserManagerForCurrentProject(state);
  });

  const boardMembershipsByRole = useMemo(
    () => groupBy(boardMemberships, 'role'),
    [boardMemberships],
  );

  const boardTeamsByRole = useMemo(() => groupBy(boardTeams, 'role'), [boardTeams]);

  const AddPopup = usePopup(AddStep);
  const AddTeamPopup = usePopup(AddTeamStep);

  return (
    <>
      {boardMemberships.length > 0 && (
        <div className={classNames(styles.segment, styles.groups)}>
          {[BoardMembershipRoles.EDITOR, BoardMembershipRoles.VIEWER].map(
            (role) =>
              boardMembershipsByRole[role] && (
                <Group
                  key={role}
                  items={boardMembershipsByRole[role]}
                  role={role}
                  groupsTotal={Object.keys(boardMembershipsByRole).length}
                />
              ),
          )}
        </div>
      )}
      {boardTeams.length > 0 && (
        <div className={classNames(styles.segment, styles.groups)}>
          {[BoardMembershipRoles.EDITOR, BoardMembershipRoles.VIEWER].map(
            (role) =>
              boardTeamsByRole[role] && (
                <TeamGroup key={`team-${role}`} items={boardTeamsByRole[role]} role={role} />
              ),
          )}
        </div>
      )}
      {canAdd && (
        <>
          <AddPopup>
            <Button icon="add user" className={classNames(styles.segment, styles.addButton)} />
          </AddPopup>
          <AddTeamPopup>
            <Button icon="users" className={classNames(styles.segment, styles.addButton)} />
          </AddTeamPopup>
        </>
      )}
    </>
  );
});

export default BoardMemberships;
