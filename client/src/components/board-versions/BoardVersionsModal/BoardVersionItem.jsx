/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { formatDistanceToNow } from 'date-fns';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Confirm, Icon } from 'semantic-ui-react';

import styles from './BoardVersionItem.module.scss';

const BoardVersionItem = React.memo(({ version, onDelete, onRestore, currentUserId }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [createBackup, setCreateBackup] = useState(true);

  const [t] = useTranslation();

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete(version.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [version.id, onDelete]);

  const handleRestore = useCallback(async () => {
    setIsRestoring(true);
    try {
      await onRestore(version.id, { createBackup });
    } finally {
      setIsRestoring(false);
      setShowRestoreConfirm(false);
    }
  }, [version.id, onRestore, createBackup]);

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const isCreator = version.creatorUserId === currentUserId;

  const getListCount = () => {
    if (!version.snapshotData) return 0;
    try {
      const data = JSON.parse(version.snapshotData);
      return data.lists?.length || 0;
    } catch {
      return 0;
    }
  };

  const getCardCount = () => {
    if (!version.snapshotData) return 0;
    try {
      const data = JSON.parse(version.snapshotData);
      return data.cards?.length || 0;
    } catch {
      return 0;
    }
  };

  return (
    <>
      <div className={styles.versionRow}>
        <div className={styles.nameColumn}>
          <div className={styles.name}>
            <Icon name="tag" className={styles.icon} />
            {version.name || 'Untitled Version'}
          </div>
          {version.description && <div className={styles.description}>{version.description}</div>}
        </div>

        <div className={styles.dateColumn}>
          <Icon name="clock" className={styles.icon} />
          {formatDate(version.createdAt)}
        </div>

        <div className={styles.statsColumn}>
          <div className={styles.stat}>
            <Icon name="list" className={styles.icon} />
            {getListCount()} lists
          </div>
          <div className={styles.stat}>
            <Icon name="sticky note" className={styles.icon} />
            {getCardCount()} cards
          </div>
        </div>

        <div className={styles.badgeColumn}>
          {isCreator && (
            <span className={`${styles.versionBadge} ${styles.createdByYouBadge}`}>
              <Icon name="user" />
              Created by you
            </span>
          )}
          {version.isAutoCreated && (
            <span className={`${styles.versionBadge} ${styles.autoCreatedBadge}`}>
              <Icon name="robot" />
              Auto-created
            </span>
          )}
          {!isCreator && !version.isAutoCreated && (
            <span className={styles.versionBadge}>
              <Icon name="tag" />
              Version
            </span>
          )}
        </div>

        <div className={styles.actionsColumn}>
          <Button
            icon
            basic
            color="blue"
            size="small"
            title={t('action.restore', { defaultValue: 'Restore' })}
            aria-label={t('action.restore', { defaultValue: 'Restore' })}
            onClick={() => setShowRestoreConfirm(true)}
            disabled={isRestoring}
            className={styles.restoreAction}
          >
            <Icon name="undo" />
          </Button>
          <Button
            icon
            basic
            color="red"
            size="small"
            title={t('action.delete', { defaultValue: 'Delete' })}
            aria-label={t('action.delete', { defaultValue: 'Delete' })}
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className={styles.deleteAction}
          >
            <Icon name="trash" />
          </Button>
        </div>
      </div>

      <Confirm
        open={showDeleteConfirm}
        header={t('common.confirmDelete', { defaultValue: 'Confirm Delete' })}
        content={t('common.confirmDeleteVersion', {
          defaultValue:
            'Are you sure you want to delete this version? This action cannot be undone.',
        })}
        confirmButton={t('action.delete', { defaultValue: 'Delete' })}
        cancelButton={t('common.cancel', { defaultValue: 'Cancel' })}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={isDeleting}
      />

      <Confirm
        open={showRestoreConfirm}
        header={t('common.confirmRestore', { defaultValue: 'Confirm Restore' })}
        content={
          <div className={styles.restoreConfirmContent}>
            <div style={{ marginBottom: 8 }}>
              {t('common.confirmRestoreVersion', {
                defaultValue:
                  'Are you sure you want to restore this version? This will replace the current board state.',
              })}
            </div>
            <Checkbox
              toggle
              checked={createBackup}
              onChange={(e, data) => setCreateBackup(Boolean(data.checked))}
              label={t('common.createBackupBeforeRestore', {
                defaultValue: 'Create a backup before restoring',
              })}
            />
          </div>
        }
        confirmButton={t('action.restore', { defaultValue: 'Restore' })}
        cancelButton={t('common.cancel', { defaultValue: 'Cancel' })}
        onConfirm={handleRestore}
        onCancel={() => setShowRestoreConfirm(false)}
        loading={isRestoring}
      />
    </>
  );
});

BoardVersionItem.propTypes = {
  version: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    isAutoCreated: PropTypes.bool,
    creatorUserId: PropTypes.string,
    snapshotData: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onRestore: PropTypes.func.isRequired,
  currentUserId: PropTypes.string.isRequired,
};

export default BoardVersionItem;
