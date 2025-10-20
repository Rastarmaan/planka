/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Icon, Loader, Message, Pagination, Tab } from 'semantic-ui-react';

import api from '../../../api';
import selectors from '../../../selectors';
import CreateVersionForm from '../../project-versions/ProjectVersionsModal/CreateVersionForm';
import ProjectVersionItem from '../../project-versions/ProjectVersionsModal/ProjectVersionItem';

import styles from './VersionsPane.module.scss';

const ITEMS_PER_PAGE = 5;

const VersionsPane = React.memo(() => {
  const currentProject = useSelector(selectors.selectCurrentProject);
  const currentUser = useSelector(selectors.selectCurrentUser);
  const accessToken = useSelector(selectors.selectAccessToken);

  const [versions, setVersions] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [t] = useTranslation();

  const getAuthHeaders = useCallback(() => {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }, [accessToken]);

  const loadVersions = useCallback(async () => {
    if (!currentProject?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const params = {
        limit: ITEMS_PER_PAGE,
        offset,
      };

      const response = await api.getProjectVersions(currentProject.id, getAuthHeaders(), params);
      setVersions(response.items || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load project versions');
    } finally {
      setIsLoading(false);
    }
  }, [currentProject?.id, getAuthHeaders, currentPage]);

  const handleCreateVersion = useCallback(
    async (data) => {
      if (!currentProject?.id) return;

      setIsCreating(true);
      setError(null);

      try {
        const requestId = `create-version-${Date.now()}`;
        await api.createProjectVersion(currentProject.id, data, requestId, getAuthHeaders());

        setShowCreateForm(false);

        if (currentPage !== 1) {
          setCurrentPage(1);
        } else {
          const params = {
            limit: ITEMS_PER_PAGE,
            offset: 0,
          };
          const response = await api.getProjectVersions(
            currentProject.id,
            getAuthHeaders(),
            params,
          );
          setVersions(response.items || []);
          setTotal(response.total || 0);
        }
      } catch (err) {
        setError(err.message || 'Failed to create project version');
      } finally {
        setIsCreating(false);
      }
    },
    [currentProject?.id, getAuthHeaders, currentPage],
  );

  const handleDeleteVersion = useCallback(
    async (versionId) => {
      if (!currentProject?.id) return;

      try {
        const requestId = `delete-version-${Date.now()}`;
        await api.deleteProjectVersion(currentProject.id, versionId, requestId, getAuthHeaders());

        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const params = {
          limit: ITEMS_PER_PAGE,
          offset,
        };
        const response = await api.getProjectVersions(currentProject.id, getAuthHeaders(), params);
        setVersions(response.items || []);
        setTotal(response.total || 0);

        if (response.items.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        setError(err.message || 'Failed to delete project version');
      }
    },
    [currentProject?.id, getAuthHeaders, currentPage],
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

  const handlePageChange = useCallback((e, { activePage }) => {
    setCurrentPage(activePage);
  }, []);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      {error && (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      )}

      <div className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.description}>
            {t('common.projectVersionsDescription', {
              defaultValue:
                'Create snapshots of your entire project (all boards, cards, and tasks) and restore them later.',
            })}
          </p>
        </div>
        <Button
          icon
          labelPosition="left"
          color="blue"
          size="small"
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={isCreating}
          className={styles.createButton}
        >
          <Icon name="plus" />
          {t('action.createVersion', { defaultValue: 'Create Version' })}
        </Button>
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
        {!isLoading && total === 0 && (
          <div className={styles.emptyState}>
            <Icon name="history" size="huge" />
            <div className={styles.emptyTitle}>
              {t('common.noVersionsFound', { defaultValue: 'No versions found' })}
            </div>
            <div className={styles.emptyDescription}>
              {t('common.noProjectVersionsYet', {
                defaultValue:
                  'Create your first project version to start tracking changes and restore previous states.',
              })}
            </div>
          </div>
        )}
        {!isLoading && versions.length > 0 && (
          <>
            <div className={styles.tableHeader}>
              <div className={styles.nameColumn}>{t('common.name', { defaultValue: 'Name' })}</div>
              <div className={styles.dateColumn}>
                {t('common.created', { defaultValue: 'Created' })}
              </div>
              <div className={styles.statsColumn}>
                {t('common.content', { defaultValue: 'Content' })}
              </div>
              <div className={styles.badgeColumn}>{t('common.type', { defaultValue: 'Type' })}</div>
              <div className={styles.actionsColumn}>
                {t('common.actions', { defaultValue: 'Actions' })}
              </div>
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

      {!isLoading && total > ITEMS_PER_PAGE && (
        <div className={styles.pagination}>
          <Pagination
            activePage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            firstItem={null}
            lastItem={null}
            ellipsisItem={{ content: <Icon name="ellipsis horizontal" />, icon: true }}
            prevItem={{ content: <Icon name="angle left" />, icon: true }}
            nextItem={{ content: <Icon name="angle right" />, icon: true }}
          />
        </div>
      )}
    </Tab.Pane>
  );
});

export default VersionsPane;
