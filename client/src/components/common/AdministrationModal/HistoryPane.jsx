/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, Form, Icon, List, Segment, TextArea } from 'semantic-ui-react';

import entryActions from '../../../entry-actions';
import selectors, { selectProjectHistoriesByProjectId } from '../../../selectors';

import styles from './HistoryPane.module.scss';

const HistoryPane = React.memo(() => {
  const dispatch = useDispatch();
  const projects = useSelector(selectors.selectAllProjects);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const histories = useSelector((state) =>
    selectProjectHistoriesByProjectId(state, selectedProjectId),
  );

  const usersById = useSelector((state) => {
    if (!histories) {
      return {};
    }

    return histories.reduce((acc, { createdByUserId }) => {
      if (createdByUserId && !acc[createdByUserId]) {
        const user = selectors.selectUserById(state, createdByUserId);

        if (user) {
          acc[createdByUserId] = user;
        }
      }

      return acc;
    }, {});
  });

  useEffect(() => {
    if (!selectedProjectId && projects?.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      return undefined;
    }

    dispatch(entryActions.fetchProjectHistories(selectedProjectId, null));

    return undefined;
  }, [dispatch, selectedProjectId]);

  const projectOptions = useMemo(
    () =>
      projects
        .map((project) => ({
          key: project.id,
          value: project.id,
          text: project.name,
        }))
        .sort((a, b) => a.text.localeCompare(b.text)),
    [projects],
  );

  const handleProjectChange = useCallback((_, { value }) => {
    setSelectedProjectId(value);
    setEditingId(null);
    setEditingText('');
    setNewText('');
  }, []);

  const handleCreate = useCallback(() => {
    if (!selectedProjectId || !newText.trim()) {
      return;
    }

    dispatch(
      entryActions.createProjectHistory(selectedProjectId, {
        text: newText.trim(),
      }),
    );
    setNewText('');
  }, [dispatch, newText, selectedProjectId]);

  const handleEdit = useCallback((history) => {
    setEditingId(history.id);
    setEditingText(history.text || '');
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingText('');
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingId || !editingText.trim()) {
      return;
    }

    dispatch(entryActions.updateProjectHistory(editingId, { text: editingText.trim() }));
    setEditingId(null);
    setEditingText('');
  }, [dispatch, editingId, editingText]);

  const handleDelete = useCallback(
    (id) => {
      dispatch(entryActions.deleteProjectHistory(id));
    },
    [dispatch],
  );

  return (
    <div className={styles.wrapper}>
      <Segment className={styles.controls}>
        <Form>
          <Form.Field
            label="Project"
            control={Dropdown}
            id="history-project-select"
            selection
            search
            placeholder="Select project"
            options={projectOptions}
            value={selectedProjectId || ''}
            onChange={handleProjectChange}
            noResultsMessage="No projects"
          />
        </Form>
      </Segment>

      <Segment className={styles.listSegment}>
        <div className={styles.listHeader}>History</div>
        {histories && histories.length > 0 ? (
          <List divided relaxed>
            {histories.map((history) => (
              <List.Item key={history.id} className={styles.listItem}>
                <List.Content floated="right" className={styles.actions}>
                  {editingId === history.id ? (
                    <>
                      <Button size="small" primary onClick={handleSaveEdit}>
                        <Icon name="save" /> Save
                      </Button>
                      <Button size="small" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="small" basic onClick={() => handleEdit(history)}>
                        <Icon name="edit" /> Edit
                      </Button>
                      <Button size="small" basic negative onClick={() => handleDelete(history.id)}>
                        <Icon name="trash" /> Delete
                      </Button>
                    </>
                  )}
                </List.Content>
                <List.Icon name="clock outline" size="large" verticalAlign="middle" />
                <List.Content className={styles.listContent}>
                  <div className={styles.headerRow}>
                    <span className={styles.timestamp}>
                      {history.createdAt
                        ? new Date(history.createdAt).toLocaleString()
                        : 'Unknown date'}
                    </span>
                    <span className={styles.meta}>
                      <Icon name="user outline" />
                      {history.createdByUserId
                        ? usersById[history.createdByUserId]?.name ||
                          usersById[history.createdByUserId]?.username ||
                          usersById[history.createdByUserId]?.email ||
                          'Unknown user'
                        : 'Unknown user'}
                    </span>
                  </div>
                  {editingId === history.id ? (
                    <TextArea
                      className={styles.textarea}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <List.Description className={styles.description}>
                      {history.text}
                    </List.Description>
                  )}
                </List.Content>
              </List.Item>
            ))}
          </List>
        ) : (
          <div className={styles.empty}>No history entries found.</div>
        )}
      </Segment>

      <Segment className={styles.addSegment}>
        <Form>
          <Form.Field
            control={TextArea}
            label="Add New History"
            id="history-new-text"
            placeholder="Enter history text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            rows={4}
            disabled={!selectedProjectId}
          />
          <Button
            primary
            onClick={handleCreate}
            disabled={!selectedProjectId || !newText.trim()}
            icon
            labelPosition="left"
          >
            <Icon name="plus" /> Add
          </Button>
        </Form>
      </Segment>
    </div>
  );
});

export default HistoryPane;
