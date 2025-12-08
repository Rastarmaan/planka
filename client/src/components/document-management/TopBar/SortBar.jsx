/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Icon } from 'semantic-ui-react';

import styles from './TopBar.module.scss';

const SortBar = React.memo(
  ({
    sortBy,
    selectedFile,
    selectedFileData,
    currentPath,
    onSortChange,
    onPreview,
    onShare,
    onDelete,
    onDownload,
    onRename,
    onGoBack,
    canShare,
    canDelete,
    canRename,
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

    const canPreviewFile = useCallback(() => {
      if (!selectedFileData || selectedFileData.type !== 'file') return false;
      const { mimeType, name } = selectedFileData;

      // Image files
      if (mimeType && mimeType.startsWith('image/')) return true;

      // Video files
      if (mimeType && mimeType.startsWith('video/')) return true;

      // Audio files
      if (mimeType && mimeType.startsWith('audio/')) return true;
      if (name) {
        const ext = name.split('.').pop().toLowerCase();
        if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma', 'aiff'].includes(ext)) return true;
      }

      // PDF files
      if (mimeType === 'application/pdf') return true;
      if (name && name.toLowerCase().endsWith('.pdf')) return true;

      // Text/code files
      const textMimeTypes = [
        'text/plain',
        'text/markdown',
        'text/csv',
        'text/html',
        'text/css',
        'text/javascript',
        'text/xml',
        'application/json',
        'application/javascript',
        'application/xml',
      ];
      if (mimeType && (textMimeTypes.includes(mimeType) || mimeType.startsWith('text/'))) {
        return true;
      }
      if (name) {
        const ext = name.split('.').pop().toLowerCase();
        const textExtensions = [
          'txt',
          'md',
          'markdown',
          'csv',
          'tsv',
          'log',
          'html',
          'htm',
          'css',
          'scss',
          'sass',
          'less',
          'js',
          'jsx',
          'ts',
          'tsx',
          'mjs',
          'cjs',
          'py',
          'pyw',
          'java',
          'kt',
          'c',
          'cpp',
          'h',
          'hpp',
          'cs',
          'go',
          'rs',
          'rb',
          'php',
          'swift',
          'scala',
          'sh',
          'bash',
          'zsh',
          'ps1',
          'bat',
          'cmd',
          'json',
          'xml',
          'yaml',
          'yml',
          'toml',
          'ini',
          'cfg',
          'conf',
          'env',
          'sql',
          'vue',
          'svelte',
        ];
        if (textExtensions.includes(ext)) return true;
      }

      return false;
    }, [selectedFileData]);

    const isPreviewable = canPreviewFile();

    const isFolder = selectedFileData?.type === 'folder';

    const canGoBack = currentPath && currentPath.length > 0;

    return (
      <div className={styles.sortBar}>
        <div className={styles.sortLeft}>
          {canGoBack && (
            <Button icon className={styles.backButton} onClick={onGoBack} title={t('common.back')}>
              <Icon name="arrow left" />
            </Button>
          )}
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
            {isPreviewable && (
              <Button icon className={styles.actionButton} onClick={onPreview}>
                <Icon name="eye" />
              </Button>
            )}

            {canDelete && (
              <Button icon onClick={onDelete} className={styles.actionButton}>
                <Icon name="trash alternate outline" />
              </Button>
            )}
            {/* Hide ellipsis menu for folders with view-only permission */}
            {!(isFolder && !canRename && !canShare) && (
              <Dropdown
                icon="ellipsis vertical"
                direction="left"
                button
                className={styles.actionButton}
              >
                <Dropdown.Menu>
                  {isFolder && canRename && (
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
            )}
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
    name: PropTypes.string,
    type: PropTypes.string,
    mimeType: PropTypes.string,
  }),
  currentPath: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
    }),
  ),
  onSortChange: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onRename: PropTypes.func,
  onGoBack: PropTypes.func,
  canShare: PropTypes.bool,
  canDelete: PropTypes.bool,
  canRename: PropTypes.bool,
};

SortBar.defaultProps = {
  selectedFile: null,
  selectedFileData: null,
  currentPath: [],
  onRename: null,
  onGoBack: null,
  canShare: false,
  canDelete: false,
  canRename: false,
};

export default SortBar;
