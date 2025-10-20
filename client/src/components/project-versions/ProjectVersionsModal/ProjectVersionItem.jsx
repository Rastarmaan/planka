/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { formatDistanceToNow } from 'date-fns';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Confirm, Icon } from 'semantic-ui-react';

import styles from './ProjectVersionItem.module.scss';

const ProjectVersionItem = React.memo(({ version, onDelete, onRestore, currentUserId }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

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
      await onRestore(version.id);
    } finally {
      setIsRestoring(false);
      setShowRestoreConfirm(false);
    }
  }, [version.id, onRestore]);

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const isCreator = version.creatorUserId === currentUserId;

  const getBoardCount = () => {
    return version.metadata?.boardCount || 0;
  };

  const getCardCount = () => {
    return version.metadata?.cardCount || 0;
  };

  const getListCount = () => {
    return version.metadata?.listCount || 0;
  };

  return (
    <>
      <div className={styles.versionRow}>
        <div className={styles.nameColumn}>
          <div className={styles.name}>
            <Icon name="tag" className={styles.icon} />
            {version.name || t('common.untitledVersion', { defaultValue: 'Untitled Version' })}
          </div>
          {version.description && <div className={styles.description}>{version.description}</div>}
        </div>

        <div className={styles.dateColumn}>
          <Icon name="clock" className={styles.icon} />
          {formatDate(version.createdAt)}
        </div>

        <div className={styles.statsColumn}>
          <div className={styles.stat}>
            <Icon name="folder" className={styles.icon} />
            {getBoardCount()} boards
          </div>
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
              {t('common.createdByYou', { defaultValue: 'Created by you' })}
            </span>
          )}
          {version.isAutoCreated && (
            <span className={`${styles.versionBadge} ${styles.autoCreatedBadge}`}>
              <Icon name="robot" />
              {t('common.autoCreated', { defaultValue: 'Auto-created' })}
            </span>
          )}
          {!isCreator && !version.isAutoCreated && (
            <span className={styles.versionBadge}>
              <Icon name="tag" />
              {t('common.version', { defaultValue: 'Version' })}
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
        header={t('common.deleteVersion', { defaultValue: 'Delete Version' })}
        content={t('common.areYouSureYouWantToDeleteThisVersion', {
          defaultValue:
            'Are you sure you want to delete this version? This action cannot be undone.',
        })}
        confirmButton={t('action.delete', { defaultValue: 'Delete' })}
        cancelButton={t('action.cancel', { defaultValue: 'Cancel' })}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <Confirm
        open={showRestoreConfirm}
        header={t('common.restoreVersion', { defaultValue: 'Restore Version' })}
        content={t('common.areYouSureYouWantToRestoreThisProjectVersion', {
          defaultValue:
            'Are you sure you want to restore this project version? This will replace ALL current boards, lists, and cards with the data from this version. This action cannot be undone.',
        })}
        confirmButton={t('action.restore', { defaultValue: 'Restore' })}
        cancelButton={t('action.cancel', { defaultValue: 'Cancel' })}
        onConfirm={handleRestore}
        onCancel={() => setShowRestoreConfirm(false)}
      />
    </>
  );
});

ProjectVersionItem.propTypes = {
  version: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onDelete: PropTypes.func.isRequired,
  onRestore: PropTypes.func.isRequired,
  currentUserId: PropTypes.string,
};

ProjectVersionItem.defaultProps = {
  currentUserId: null,
};

export default ProjectVersionItem;
