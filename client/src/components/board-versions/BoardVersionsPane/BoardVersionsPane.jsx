/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Icon, Loader, Message } from 'semantic-ui-react';

import api from '../../../api';
import selectors from '../../../selectors';
import BoardVersionItem from '../BoardVersionsModal/BoardVersionItem';
import CreateVersionForm from '../BoardVersionsModal/CreateVersionForm';

import styles from './BoardVersionsPane.module.scss';

const BoardVersionsPane = React.memo(() => {
  const currentBoard = useSelector(selectors.selectCurrentBoard);
  const currentUser = useSelector(selectors.selectCurrentUser);
  const accessToken = useSelector(selectors.selectAccessToken);

  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [t] = useTranslation();

  const getAuthHeaders = useCallback(() => {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }, [accessToken]);

  const loadVersions = useCallback(async () => {
    if (!currentBoard?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getBoardVersions(currentBoard.id, { limit: 10 }, getAuthHeaders());
      setVersions(response.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load board versions');
    } finally {
      setIsLoading(false);
    }
  }, [currentBoard?.id, getAuthHeaders]);

  const handleCreateVersion = useCallback(
    async (data) => {
      if (!currentBoard?.id) return;

      setIsCreating(true);
      setError(null);

      try {
        const requestId = `create-version-${Date.now()}`;
        const response = await api.createBoardVersion(
          currentBoard.id,
          data,
          requestId,
          getAuthHeaders(),
        );

        setVersions((prev) => [response.item, ...prev]);
        setShowCreateForm(false);
      } catch (err) {
        setError(err.message || 'Failed to create board version');
      } finally {
        setIsCreating(false);
      }
    },
    [currentBoard?.id, getAuthHeaders],
  );

  const handleDeleteVersion = useCallback(
    async (versionId) => {
      if (!currentBoard?.id) return;

      try {
        const requestId = `delete-version-${Date.now()}`;
        await api.deleteBoardVersion(currentBoard.id, versionId, requestId, getAuthHeaders());

        setVersions((prev) => prev.filter((v) => v.id !== versionId));
      } catch (err) {
        setError(err.message || 'Failed to delete board version');
      }
    },
    [currentBoard?.id, getAuthHeaders],
  );

  const handleRestoreVersion = useCallback(
    async (versionId, force = false) => {
      if (!currentBoard?.id) return;

      try {
        const requestId = `restore-version-${Date.now()}`;
        await api.restoreBoardVersion(
          currentBoard.id,
          versionId,
          { force },
          requestId,
          getAuthHeaders(),
        );

        await loadVersions();
      } catch (err) {
        if (err.code === 'backupRequired') {
          const confirmed = window.confirm(
            'Current board state must be backed up before restoration. Create a backup now?',
          );
          if (confirmed) {
            await handleCreateVersion({
              name: `Backup before restore ${new Date().toLocaleString()}`,
              description: 'Automatic backup created before version restoration',
            });
            await handleRestoreVersion(versionId, true);
          }
        } else {
          console.log('err', err);
          setError(err.message || 'Failed to restore board version');
        }
      }
    },
    [currentBoard?.id, loadVersions, handleCreateVersion, getAuthHeaders],
  );

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>
          <Icon name="history" className={styles.icon} />
          {t('common.boardVersions', {
            context: 'title',
            defaultValue: 'Board Versions',
          })}
        </h3>
        <p className={styles.description}>
          {t('common.boardVersionsDescription', {
            defaultValue:
              'Create snapshots of your board to track changes and restore previous states.',
          })}
        </p>
      </div>

      {error && (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      )}

      <div className={styles.actions}>
        <Button
          primary
          icon="plus"
          content={t('action.createVersion', { defaultValue: 'Create Version' })}
          onClick={() => setShowCreateForm(true)}
          disabled={isCreating}
        />
      </div>

      {showCreateForm && (
        <div className={styles.createForm}>
          <CreateVersionForm
            onSubmit={handleCreateVersion}
            onCancel={() => setShowCreateForm(false)}
            isLoading={isCreating}
          />
        </div>
      )}

      <div className={styles.versionsList}>
        {isLoading && <Loader active inline="centered" />}
        {!isLoading && versions.length === 0 && (
          <div className={styles.emptyState}>
            <Icon name="history" className={styles.icon} />
            <div className={styles.title}>No versions found</div>
            <div className={styles.description}>
              Create your first board version to start tracking changes and restore previous states.
            </div>
          </div>
        )}
        {!isLoading && versions.length > 0 && (
          <>
            <div className={styles.tableHeader}>
              <div className={styles.nameColumn}>Name</div>
              <div className={styles.dateColumn}>Created</div>
              <div className={styles.statsColumn}>Content</div>
              <div className={styles.badgeColumn}>Type</div>
              <div className={styles.actionsColumn}>Actions</div>
            </div>
            {versions.map((version) => (
              <BoardVersionItem
                key={version.id}
                version={version}
                onDelete={handleDeleteVersion}
                onRestore={handleRestoreVersion}
                currentUserId={currentUser?.id}
              />
            ))}
          </>
        )}
      </div>

      {versions.length > 0 && (
        <div className={styles.footer}>
          <p className={styles.note}>
            <Icon name="info circle" />
            {t('common.versionsNote', {
              defaultValue:
                'Showing recent versions. Use the board actions menu to view all versions.',
            })}
          </p>
        </div>
      )}
    </div>
  );
});

export default BoardVersionsPane;
