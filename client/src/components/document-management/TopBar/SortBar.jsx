/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Icon } from 'semantic-ui-react';

import styles from './TopBar.module.scss';

const SortBar = React.memo(
  ({
    sortBy,
    selectedFile,
    selectedFileData,
    onSortChange,
    onPreview,
    onShare,
    onDelete,
    onDownload,
    onRename,
    canShare,
    canDelete,
  }) => {
    const [t] = useTranslation();

    const getSortText = () => {
      switch (sortBy) {
        case 'name':
          return t('common.name');
        case 'size':
          return t('common.size');
        case 'modified':
        default:
          return t('common.date');
      }
    };

    const isImageFile =
      selectedFileData?.type === 'file' &&
      selectedFileData?.mimeType &&
      selectedFileData.mimeType.startsWith('image/');

    const isFolder = selectedFileData?.type === 'folder';

    return (
      <div className={styles.sortBar}>
        <div className={styles.sortLeft}>
          <Icon name="sort" />
          <Dropdown
            text={getSortText()}
            inline
            className={styles.sortDropdown}
            value={sortBy}
            onChange={(e, { value }) => onSortChange(value)}
            options={[
              { key: 'modified', text: t('common.date'), value: 'modified' },
              { key: 'name', text: t('common.name'), value: 'name' },
              { key: 'size', text: t('common.size'), value: 'size' },
            ]}
          />
        </div>
        {selectedFile && (
          <div className={styles.sortActions}>
            {isImageFile && (
              <Button icon className={styles.actionButton} onClick={onPreview}>
                <Icon name="eye" />
              </Button>
            )}

            {canDelete && (
              <Button icon onClick={onDelete} className={styles.actionButton}>
                <Icon name="trash alternate outline" />
              </Button>
            )}
            <Dropdown
              icon="ellipsis vertical"
              direction="left"
              button
              className={styles.actionButton}
            >
              <Dropdown.Menu>
                {isFolder && (
                  <Dropdown.Item
                    icon="pencil"
                    text={t('action.rename', 'Rename')}
                    onClick={onRename}
                  />
                )}
                {canShare && (
                  <Dropdown.Item
                    icon="share alternate"
                    text={t('documentManagement.share')}
                    onClick={onShare}
                  />
                )}
                <Dropdown.Item
                  icon="download"
                  text={t('documentManagement.download')}
                  onClick={onDownload}
                />
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
      </div>
    );
  },
);

SortBar.propTypes = {
  sortBy: PropTypes.string.isRequired,
  selectedFile: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  selectedFileData: PropTypes.shape({
    type: PropTypes.string,
    mimeType: PropTypes.string,
  }),
  onSortChange: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onRename: PropTypes.func,
  canShare: PropTypes.bool,
  canDelete: PropTypes.bool,
};

SortBar.defaultProps = {
  selectedFile: null,
  selectedFileData: null,
  onRename: null,
  canShare: false,
  canDelete: false,
};

export default SortBar;
