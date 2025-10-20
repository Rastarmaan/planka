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
import CreateVersionForm from './CreateVersionForm';
import ProjectVersionItem from './ProjectVersionItem';

import styles from './ProjectVersionsModal.module.scss';

const ProjectVersionsModal = React.memo(() => {
  const currentProject = useSelector(selectors.selectCurrentProject);
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
    if (!currentProject?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getProjectVersions(currentProject.id, getAuthHeaders(), {});
      setVersions(response.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load project versions');
    } finally {
      setIsLoading(false);
    }
  }, [currentProject?.id, getAuthHeaders]);

  const handleCreateVersion = useCallback(
    async (data) => {
      if (!currentProject?.id) return;

      setIsCreating(true);
      setError(null);

      try {
        const requestId = `create-version-${Date.now()}`;
        const response = await api.createProjectVersion(
          currentProject.id,
          data,
          requestId,
          getAuthHeaders(),
        );

        setVersions((prev) => [response.item, ...prev]);
        setShowCreateForm(false);
      } catch (err) {
        setError(err.message || 'Failed to create project version');
      } finally {
        setIsCreating(false);
      }
    },
    [currentProject?.id, getAuthHeaders],
  );

  const handleDeleteVersion = useCallback(
    async (versionId) => {
      if (!currentProject?.id) return;

      try {
        const requestId = `delete-version-${Date.now()}`;
        await api.deleteProjectVersion(currentProject.id, versionId, requestId, getAuthHeaders());

        setVersions((prev) => prev.filter((v) => v.id !== versionId));
      } catch (err) {
        setError(err.message || 'Failed to delete project version');
      }
    },
    [currentProject?.id, getAuthHeaders],
  );

  const handleRestoreVersion = useCallback(
    async (versionId) => {
      if (!currentProject?.id) return;

      try {
        const requestId = `restore-version-${Date.now()}`;

        await api.restoreProjectVersion(currentProject.id, versionId, requestId, getAuthHeaders(), {
          force: true,
        });

        window.location.reload();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to restore version', err);
        setError(err.message || 'Failed to restore project version');
      }
    },
    [currentProject?.id, getAuthHeaders],
  );

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const [ClosableModal] = useClosableModal();

  return (
    <ClosableModal closeIcon size="large" centered={false} onClose={handleClose}>
      <ClosableModal.Header>
        <Icon name="history" />
        {t('common.projectVersions', {
          context: 'title',
          defaultValue: 'Project Versions',
        })}
      </ClosableModal.Header>
      <ClosableModal.Content>
        <div className={styles.container}>
          {error && (
            <Message negative>
              <Message.Header>Error</Message.Header>
              <p>{error}</p>
            </Message>
          )}

          <Message info className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.headerText}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  {t('common.projectVersions', {
                    context: 'title',
                    defaultValue: 'Project Versions',
                  })}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                  Manage and restore complete project snapshots including all boards, cards, and
                  tasks
                </p>
              </div>
              <Button
                secondary
                icon="plus"
                content={t('action.createVersion', { defaultValue: 'Create Version' })}
                onClick={() => setShowCreateForm(true)}
                disabled={isCreating}
              />
            </div>
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
                <Icon name="history" size="huge" className={styles.icon} />
                <div className={styles.title}>No versions found</div>
                <div className={styles.description}>
                  Create your first project version to start tracking changes and restore previous
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
                  <ProjectVersionItem
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

export default ProjectVersionsModal;
