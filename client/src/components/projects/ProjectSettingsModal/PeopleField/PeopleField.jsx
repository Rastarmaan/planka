/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Dropdown, Form, Icon, Input, Label, Segment, Table } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import api from '../../../../api';
import { getAccessToken } from '../../../../utils/access-token-storage';
import UserAvatar from '../../../users/UserAvatar';

import styles from './PeopleField.module.scss';

const getAuthHeaders = () => {
  const accessToken = getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
};

const PeopleField = React.memo(({ field, projectId }) => {
  const [t] = useTranslation();

  const allUsers = useSelector(selectors.selectActiveUsers);
  const [people, setPeople] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleValue, setEditingRoleValue] = useState('');

  useEffect(() => {
    const loadPeople = async () => {
      setIsLoading(true);
      try {
        const data = await api.getProjectProfilePeople(projectId, field.id, getAuthHeaders());
        setPeople(data.items || []);
      } catch (error) {
        setPeople([]);
      }
      setIsLoading(false);
    };

    if (projectId && field.id) {
      loadPeople();
    }
  }, [projectId, field.id]);

  const addedUserIds = people.map((p) => p.userId);
  const userOptions = allUsers
    .filter((user) => !addedUserIds.includes(user.id))
    .map((user) => ({
      key: user.id,
      value: user.id,
      text: user.name || user.username || user.email,
      image: user.avatarUrl ? { avatar: true, src: user.avatarUrl } : null,
    }));

  const handleUserSelect = useCallback((e, { value }) => {
    setSelectedUserId(value);
  }, []);

  const handleRoleChange = useCallback((e, { value }) => {
    setNewRole(value);
  }, []);

  const handleAddPerson = useCallback(async () => {
    if (!selectedUserId) return;
    if (!projectId) return;

    try {
      const data = await api.createProjectProfilePerson(
        projectId,
        field.id,
        { userId: selectedUserId, role: newRole },
        getAuthHeaders(),
      );
      if (data.item) {
        setPeople((prev) => [...prev, data.item]);
        setSelectedUserId(null);
        setNewRole('');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to add person:', error);
    }
  }, [projectId, field.id, selectedUserId, newRole]);

  const handleDeletePerson = useCallback(async (personId) => {
    try {
      await api.deleteProjectProfilePerson(personId, getAuthHeaders());
      setPeople((prev) => prev.filter((p) => p.id !== personId));
    } catch (error) {
      // Handle error silently
    }
  }, []);

  const handleStartEditRole = useCallback((person) => {
    setEditingRoleId(person.id);
    setEditingRoleValue(person.role || '');
  }, []);

  const handleCancelEditRole = useCallback(() => {
    setEditingRoleId(null);
    setEditingRoleValue('');
  }, []);

  const handleSaveRole = useCallback(
    async (personId) => {
      try {
        const data = await api.updateProjectProfilePerson(
          personId,
          { role: editingRoleValue },
          getAuthHeaders(),
        );
        if (data.item) {
          setPeople((prev) =>
            prev.map((p) => (p.id === personId ? { ...p, role: data.item.role } : p)),
          );
        }
        setEditingRoleId(null);
        setEditingRoleValue('');
      } catch (error) {
        // Handle error silently
      }
    },
    [editingRoleValue],
  );

  const handleEditRoleChange = useCallback((e, { value }) => {
    setEditingRoleValue(value);
  }, []);

  if (isLoading) {
    return (
      <Form.Field>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label>{field.label}</label>
        <Segment loading />
      </Form.Field>
    );
  }

  return (
    <Form.Field className={styles.wrapper}>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label>
        {field.label}
        {field.metadata?.isRequired && ' *'}
      </label>

      {people.length > 0 && (
        <Table basic="very" compact className={styles.peopleTable}>
          <Table.Body>
            {people.map((person) => (
              <Table.Row key={person.id}>
                <Table.Cell className={styles.userCell}>
                  {person.user ? (
                    <div className={styles.userInfo}>
                      <UserAvatar id={person.userId} size="small" />
                      <span className={styles.userName}>{person.user.name}</span>
                    </div>
                  ) : (
                    <span>{t('common.unknownUser')}</span>
                  )}
                </Table.Cell>
                <Table.Cell className={styles.roleCell}>
                  {editingRoleId === person.id ? (
                    <Input
                      size="small"
                      value={editingRoleValue}
                      onChange={handleEditRoleChange}
                      placeholder={t('common.enterRole')}
                      action
                    >
                      <input />
                      <Button
                        type="button"
                        icon="check"
                        positive
                        size="small"
                        onClick={() => handleSaveRole(person.id)}
                      />
                      <Button
                        type="button"
                        icon="close"
                        size="small"
                        onClick={handleCancelEditRole}
                      />
                    </Input>
                  ) : (
                    <Label className={styles.roleLabel} onClick={() => handleStartEditRole(person)}>
                      {person.role || t('common.noRole')}
                      <Icon name="pencil" className={styles.editIcon} />
                    </Label>
                  )}
                </Table.Cell>
                <Table.Cell className={styles.actionCell}>
                  <Button
                    type="button"
                    icon="trash"
                    size="small"
                    negative
                    onClick={() => handleDeletePerson(person.id)}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <div className={styles.addPerson}>
        <Dropdown
          placeholder={t('common.selectUser')}
          fluid
          search
          selection
          options={userOptions}
          value={selectedUserId}
          onChange={handleUserSelect}
          className={styles.userDropdown}
        />
        <Input
          placeholder={t('common.enterRole')}
          value={newRole}
          onChange={handleRoleChange}
          className={styles.roleInput}
        />
        <Button
          type="button"
          primary
          icon="add"
          content={t('action.add')}
          onClick={handleAddPerson}
          disabled={!selectedUserId}
        />
      </div>
    </Form.Field>
  );
});

PeopleField.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  field: PropTypes.object.isRequired,
  projectId: PropTypes.string.isRequired,
};

export default PeopleField;
