/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Confirm,
  Dropdown,
  Form,
  Icon,
  Input,
  Loader,
  Segment,
  Tab,
  Table,
} from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import UserAvatar from '../../users/UserAvatar';

import styles from './TeamsPane.module.scss';

const TeamsPane = React.memo(() => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState(null);

  const teams = useSelector(selectors.selectAllTeams);
  const isLoading = useSelector(selectors.selectIsTeamsLoading);
  const allUsers = useSelector(selectors.selectActiveUsers);

  useEffect(() => {
    dispatch(entryActions.fetchTeams());
  }, [dispatch]);

  const handleCreateClick = useCallback(() => {
    setIsCreating(true);
  }, []);

  const handleCancelCreate = useCallback(() => {
    setIsCreating(false);
    setNewTeamName('');
  }, []);

  const handleSubmitCreate = useCallback(() => {
    if (newTeamName.trim()) {
      dispatch(entryActions.createTeam({ name: newTeamName.trim() }));
      setIsCreating(false);
      setNewTeamName('');
    }
  }, [newTeamName, dispatch]);

  const handleEditClick = useCallback((team) => {
    setEditingTeamId(team.id);
    setEditingName(team.name);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingTeamId(null);
    setEditingName('');
  }, []);

  const handleSubmitEdit = useCallback(() => {
    if (editingName.trim() && editingTeamId) {
      dispatch(entryActions.updateTeam(editingTeamId, { name: editingName.trim() }));
      setEditingTeamId(null);
      setEditingName('');
    }
  }, [editingName, editingTeamId, dispatch]);

  const handleDeleteClick = useCallback((team) => {
    setDeleteConfirmTeam(team);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmTeam) {
      dispatch(entryActions.deleteTeam(deleteConfirmTeam.id));
      if (expandedTeamId === deleteConfirmTeam.id) {
        setExpandedTeamId(null);
      }
      setDeleteConfirmTeam(null);
    }
  }, [dispatch, expandedTeamId, deleteConfirmTeam]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmTeam(null);
  }, []);

  const handleExpandClick = useCallback((teamId) => {
    setExpandedTeamId((prev) => (prev === teamId ? null : teamId));
  }, []);

  const handleAddMember = useCallback(
    (teamId, userId) => {
      dispatch(
        entryActions.createTeamMembership(teamId, {
          userId,
        }),
      );
    },
    [dispatch],
  );

  const handleRemoveMember = useCallback(
    (membershipId) => {
      dispatch(entryActions.deleteTeamMembership(membershipId));
    },
    [dispatch],
  );

  const getAvailableUsersOptions = useCallback(
    (team) => {
      const memberUserIds = team.memberships.map((m) => m.userId);
      return allUsers
        .filter((user) => !memberUserIds.includes(user.id))
        .map((user) => ({
          key: user.id,
          value: user.id,
          text: `${user.name} (${user.email})`,
          content: (
            <div className={styles.userOption}>
              <UserAvatar id={user.id} size="tiny" />
              <span className={styles.userOptionText}>
                {user.name} ({user.email})
              </span>
            </div>
          ),
        }));
    },
    [allUsers],
  );

  if (isLoading) {
    return (
      <Tab.Pane attached={false} className={styles.wrapper}>
        <Loader active />
      </Tab.Pane>
    );
  }

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <div className={styles.header}>
        <Button positive icon labelPosition="left" onClick={handleCreateClick}>
          <Icon name="plus" />
          {t('action.createTeam')}
        </Button>
      </div>

      {isCreating && (
        <Segment className={styles.createForm}>
          <Form onSubmit={handleSubmitCreate}>
            <Form.Field>
              <Input
                placeholder={t('common.enterTeamName')}
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                autoFocus
              />
            </Form.Field>
            <Button positive type="submit" disabled={!newTeamName.trim()}>
              {t('action.create')}
            </Button>
            <Button type="button" onClick={handleCancelCreate}>
              {t('action.cancel')}
            </Button>
          </Form>
        </Segment>
      )}

      {teams.length === 0 ? (
        <Segment placeholder textAlign="center" className={styles.emptySegment}>
          <div className={styles.emptyContent}>
            <Icon name="users" size="huge" disabled />
            <p>{t('common.noTeams')}</p>
          </div>
        </Segment>
      ) : (
        <Table basic="very" className={styles.table}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t('common.name')}</Table.HeaderCell>
              <Table.HeaderCell>{t('common.members')}</Table.HeaderCell>
              <Table.HeaderCell textAlign="right">{t('common.actions')}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {teams.map((team) => (
              <React.Fragment key={team.id}>
                <Table.Row>
                  <Table.Cell>
                    {editingTeamId === team.id ? (
                      <Form onSubmit={handleSubmitEdit} className={styles.editForm}>
                        <Input
                          size="small"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          autoFocus
                          action
                        >
                          <input />
                          <Button positive size="small" type="submit" icon="check" />
                          <Button
                            size="small"
                            type="button"
                            icon="cancel"
                            onClick={handleCancelEdit}
                          />
                        </Input>
                      </Form>
                    ) : (
                      <span className={styles.teamName}>
                        <Icon name="users" />
                        {team.name}
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Button basic size="small" onClick={() => handleExpandClick(team.id)}>
                      {t('common.nMembers', { count: team.memberships.length })}
                      <Icon name={expandedTeamId === team.id ? 'chevron up' : 'chevron down'} />
                    </Button>
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <Button
                      icon="pencil"
                      size="small"
                      onClick={() => handleEditClick(team)}
                      title={t('action.edit')}
                    />
                    <Button
                      icon="trash"
                      size="small"
                      negative
                      title={t('action.delete')}
                      onClick={() => handleDeleteClick(team)}
                    />
                  </Table.Cell>
                </Table.Row>

                {expandedTeamId === team.id && (
                  <Table.Row>
                    <Table.Cell colSpan="3" className={styles.membersCell}>
                      <Segment className={styles.membersSegment}>
                        <div className={styles.membersHeader}>
                          <strong>{t('common.teamMembers')}</strong>
                          <div className={styles.addMember}>
                            <Dropdown
                              fluid
                              search
                              selection
                              options={getAvailableUsersOptions(team)}
                              placeholder={t('common.searchUsers')}
                              onChange={(e, { value }) => {
                                if (value) {
                                  handleAddMember(team.id, value);
                                }
                              }}
                              value=""
                              selectOnBlur={false}
                              noResultsMessage={t('common.noUsersFound')}
                              className={styles.userDropdown}
                            />
                          </div>
                        </div>
                        {team.memberships.length === 0 ? (
                          <p className={styles.noMembers}>{t('common.noTeamMembers')}</p>
                        ) : (
                          <div className={styles.membersList}>
                            {team.memberships.map((membership) => (
                              <div key={membership.id} className={styles.memberItem}>
                                {membership.userId && (
                                  <UserAvatar id={membership.userId} size="small" />
                                )}
                                <span className={styles.memberName}>
                                  {membership.user?.name || 'Unknown'}
                                </span>
                                <Button
                                  icon="remove"
                                  size="mini"
                                  negative
                                  onClick={() => handleRemoveMember(membership.id)}
                                  title={t('action.remove')}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </Segment>
                    </Table.Cell>
                  </Table.Row>
                )}
              </React.Fragment>
            ))}
          </Table.Body>
        </Table>
      )}

      <Confirm
        open={!!deleteConfirmTeam}
        header={t('common.deleteTeam')}
        content={
          <div className={styles.deleteConfirmContent}>
            <p>
              <strong>{t('common.deleteTeamWarning')}</strong>
            </p>
            <ul>
              <li>{t('common.deleteTeamEffect1')}</li>
              <li>{t('common.deleteTeamEffect2')}</li>
              <li>{t('common.deleteTeamEffect3')}</li>
            </ul>
            <p>{t('common.deleteTeamConfirmQuestion')}</p>
          </div>
        }
        confirmButton={<Button negative content={t('action.delete')} />}
        cancelButton={t('action.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Tab.Pane>
  );
});

export default TeamsPane;
