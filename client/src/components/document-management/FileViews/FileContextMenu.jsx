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
    const isImageFile = file.type === 'file' && file.mimeType && file.mimeType.startsWith('image/');
    const isVideoFile = file.type === 'file' && file.mimeType && file.mimeType.startsWith('video/');
    const isPreviewable = isImageFile || isVideoFile;

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
