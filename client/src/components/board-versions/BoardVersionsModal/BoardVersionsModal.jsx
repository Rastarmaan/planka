/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon, Loader, Message } from 'semantic-ui-react';

import api from '../../../api';
import entryActions from '../../../entry-actions';
import { useClosableModal } from '../../../hooks';
import selectors from '../../../selectors';
import BoardVersionItem from './BoardVersionItem';
import CreateVersionForm from './CreateVersionForm';

import styles from './BoardVersionsModal.module.scss';

const BoardVersionsModal = React.memo(() => {
  const currentBoard = useSelector(selectors.selectCurrentBoard);
  const currentUser = useSelector(selectors.selectCurrentUser);
  const accessToken = useSelector(selectors.selectAccessToken);

  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const getAuthHeaders = useCallback(() => {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }, [accessToken]);

  const handleClose = useCallback(() => {
    dispatch(entryActions.closeModal());
  }, [dispatch]);

  const loadVersions = useCallback(async () => {
    if (!currentBoard?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getBoardVersions(currentBoard.id, getAuthHeaders(), {});
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
    async (versionId, options = {}) => {
      if (!currentBoard?.id) return;

      try {
        const requestId = `restore-version-${Date.now()}`;
        if (options.createBackup) {
          await handleCreateVersion({
            name: `Backup before restore ${new Date().toLocaleString()}`,
            description: 'Automatic backup created before version restoration',
          });
        }

        await api.restoreBoardVersion(currentBoard.id, versionId, requestId, getAuthHeaders(), {
          force: true,
        });

        dispatch(entryActions.fetchBoard(currentBoard.id));
        await loadVersions();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to restore version', err);
        setError(err.message || 'Failed to restore board version');
      }
    },
    [currentBoard?.id, loadVersions, handleCreateVersion, getAuthHeaders, dispatch],
  );

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const [ClosableModal] = useClosableModal();

  return (
    <ClosableModal closeIcon size="large" centered={false} onClose={handleClose}>
      <ClosableModal.Header>
        <Icon name="history" />
        {t('common.boardVersions', {
          context: 'title',
          defaultValue: 'Board Versions',
        })}
      </ClosableModal.Header>
      <ClosableModal.Content>
        <div className={styles.container}>
          {error && (
            <div className={styles.errorMessage}>
              <div className={styles.header}>Error</div>
              <div className={styles.content}>{error}</div>
            </div>
          )}

          <Message className={styles.header}>
            <div className={styles.headerText}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                {t('common.boardVersions', {
                  context: 'title',
                  defaultValue: 'Board Versions',
                })}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                Manage and restore board snapshots
              </p>
            </div>
            <Button
              className={styles.button}
              secondary
              icon="plus"
              content={t('action.createVersion', { defaultValue: 'Create Version' })}
              onClick={() => setShowCreateForm(true)}
              disabled={isCreating}
            />
          </Message>

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
                  Create your first board version to start tracking changes and restore previous
                  states.
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
        </div>
      </ClosableModal.Content>
    </ClosableModal>
  );
});

export default BoardVersionsModal;
