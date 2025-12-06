/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, Header, Icon, Tab, Table } from 'semantic-ui-react';

import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';
import { BoardMembershipRoles } from '../../../constants/Enums';

import styles from './TeamsPane.module.scss';

const TeamsPane = React.memo(() => {
  const boardId = useSelector((state) => selectors.selectCurrentModal(state).params.id);
  const allTeams = useSelector(selectors.selectAllTeams);
  const boardTeams = useSelector((state) => selectors.selectBoardTeamsByBoardId(state, boardId));

  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  useEffect(() => {
    dispatch(entryActions.fetchTeams());
    dispatch(entryActions.fetchBoardTeams(boardId));
  }, [dispatch, boardId]);

  const availableTeams = useMemo(() => {
    const addedTeamIds = boardTeams.map((bt) => bt.teamId);
    return allTeams.filter((team) => !addedTeamIds.includes(team.id));
  }, [allTeams, boardTeams]);

  const teamOptions = useMemo(
    () =>
      availableTeams.map((team) => ({
        key: team.id,
        value: team.id,
        text: team.name,
      })),
    [availableTeams],
  );

  const roleOptions = useMemo(
    () => [
      {
        key: BoardMembershipRoles.EDITOR,
        value: BoardMembershipRoles.EDITOR,
        text: t('common.editor'),
      },
      {
        key: BoardMembershipRoles.VIEWER,
        value: BoardMembershipRoles.VIEWER,
        text: t('common.viewer'),
      },
    ],
    [t],
  );

  const handleTeamSelect = useCallback((e, { value }) => {
    setSelectedTeamId(value);
  }, []);

  const handleAddTeam = useCallback(() => {
    if (!selectedTeamId) return;
    dispatch(
      entryActions.createBoardTeam(boardId, {
        teamId: selectedTeamId,
        role: BoardMembershipRoles.EDITOR,
      }),
    );
    setSelectedTeamId(null);
  }, [boardId, dispatch, selectedTeamId]);

  const handleRoleChange = useCallback(
    (boardTeamId, role) => {
      dispatch(entryActions.updateBoardTeam(boardTeamId, { role }));
    },
    [dispatch],
  );

  const handleRemoveTeam = useCallback(
    (boardTeamId) => {
      dispatch(entryActions.deleteBoardTeam(boardTeamId));
    },
    [dispatch],
  );

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Header as="h4">{t('common.teams', { context: 'title' })}</Header>

      <div className={styles.addTeamSection}>
        <Dropdown
          placeholder={t('common.selectTeam')}
          fluid
          selection
          search
          options={teamOptions}
          value={selectedTeamId}
          onChange={handleTeamSelect}
          className={styles.teamDropdown}
          noResultsMessage={t('common.noTeamsAvailable')}
        />
        <Button
          primary
          disabled={!selectedTeamId}
          onClick={handleAddTeam}
          className={styles.addButton}
        >
          {t('action.addTeam', { context: 'title' })}
        </Button>
      </div>

      {boardTeams.length > 0 ? (
        <Table basic="very" className={styles.teamsTable}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t('common.team')}</Table.HeaderCell>
              <Table.HeaderCell>{t('common.role')}</Table.HeaderCell>
              <Table.HeaderCell textAlign="right">{t('common.actions')}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {boardTeams.map((boardTeam) => (
              <Table.Row key={boardTeam.id}>
                <Table.Cell>
                  <Icon name="users" />
                  {boardTeam.team?.name || t('common.unknownTeam')}
                </Table.Cell>
                <Table.Cell>
                  <Dropdown
                    selection
                    compact
                    options={roleOptions}
                    value={boardTeam.role}
                    onChange={(e, { value }) => handleRoleChange(boardTeam.id, value)}
                  />
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Button
                    icon="trash"
                    size="small"
                    negative
                    onClick={() => handleRemoveTeam(boardTeam.id)}
                    title={t('action.removeTeam')}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        <div className={styles.noTeams}>
          <Icon name="users" size="large" />
          <p>{t('common.noTeamsAddedToBoard')}</p>
        </div>
      )}
    </Tab.Pane>
  );
});

export default TeamsPane;
