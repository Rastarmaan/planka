/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';

import styles from './FileContextMenu.module.scss';

const FileContextMenu = React.memo(
  ({
    file,
    position,
    onClose,
    onPreview,
    onShare,
    onDownload,
    onDelete,
    onRename,
    canShare,
    canDelete,
    canRename,
  }) => {
    const [t] = useTranslation();
    const menuRef = useRef(null);

    const canPreviewFile = useCallback(() => {
      if (file.type !== 'file') return false;
      const { mimeType, name } = file;

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
    }, [file]);

    const isPreviewable = canPreviewFile();

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
          onClose();
        }
      };

      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [onClose]);

    useEffect(() => {
      if (menuRef.current) {
        const menu = menuRef.current;
        const rect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let adjustedX = position.x;
        let adjustedY = position.y;

        if (rect.right > viewportWidth) {
          adjustedX = viewportWidth - rect.width - 10;
        }

        if (rect.bottom > viewportHeight) {
          adjustedY = viewportHeight - rect.height - 10;
        }

        menu.style.left = `${adjustedX}px`;
        menu.style.top = `${adjustedY}px`;
      }
    }, [position]);

    const handleAction = useCallback(
      (action, callback) => {
        if (callback) {
          callback(file);
        }
        onClose();
      },
      [file, onClose],
    );

    return (
      <div
        ref={menuRef}
        className={styles.contextMenu}
        style={{ left: position.x, top: position.y }}
      >
        {isPreviewable && (
          <div
            role="button"
            tabIndex={0}
            className={styles.menuItem}
            onClick={() => handleAction('preview', onPreview)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction('preview', onPreview)}
          >
            <Icon name="eye" />
            <span>{t('documentManagement.preview')}</span>
          </div>
        )}
        {file.type === 'file' && (
          <div
            role="button"
            tabIndex={0}
            className={styles.menuItem}
            onClick={() => handleAction('download', onDownload)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction('download', onDownload)}
          >
            <Icon name="download" />
            <span>{t('documentManagement.download')}</span>
          </div>
        )}
        {file.type === 'folder' && canRename && (
          <div
            role="button"
            tabIndex={0}
            className={styles.menuItem}
            onClick={() => handleAction('rename', onRename)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction('rename', onRename)}
          >
            <Icon name="pencil" />
            <span>{t('action.rename', 'Rename')}</span>
          </div>
        )}
        {canShare && (
          <div
            role="button"
            tabIndex={0}
            className={styles.menuItem}
            onClick={() => handleAction('share', onShare)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction('share', onShare)}
          >
            <Icon name="share alternate" />
            <span>{t('documentManagement.share')}</span>
          </div>
        )}
        {canDelete && (
          <>
            <div className={styles.menuDivider} />
            <div
              role="button"
              tabIndex={0}
              className={styles.menuItem}
              onClick={() => handleAction('delete', onDelete)}
              onKeyDown={(e) => e.key === 'Enter' && handleAction('delete', onDelete)}
            >
              <Icon name="trash alternate outline" />
              <span>{t('documentManagement.delete')}</span>
            </div>
          </>
        )}
      </div>
    );
  },
);

FileContextMenu.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    type: PropTypes.string.isRequired,
    mimeType: PropTypes.string,
  }).isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onPreview: PropTypes.func,
  onShare: PropTypes.func,
  onDownload: PropTypes.func,
  onDelete: PropTypes.func,
  onRename: PropTypes.func,
  canShare: PropTypes.bool,
  canDelete: PropTypes.bool,
  canRename: PropTypes.bool,
};

FileContextMenu.defaultProps = {
  onPreview: null,
  onShare: null,
  onDownload: null,
  onDelete: null,
  onRename: null,
  canShare: false,
  canDelete: false,
  canRename: false,
};

export default FileContextMenu;
