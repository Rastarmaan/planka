/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import selectors from '../../../selectors';

import FileContextMenu from './FileContextMenu';
import styles from './FileListRow.module.scss';

const FileListRow = React.memo(
  ({
    file,
    isSelected,
    isDragging,
    isDropTarget,
    onSelect,
    onDoubleClick,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    onPreview,
    onShare,
    onDownload,
    onDelete,
    onRename,
    contextMenuState,
    onContextMenuChange,
    canShare,
    canDelete,
    canRename,
  }) => {
    const accessToken = useSelector(selectors.selectAccessToken);
    const [imageUrl, setImageUrl] = React.useState(null);
    const [imageError, setImageError] = React.useState(false);
    const [imageLoading, setImageLoading] = React.useState(false);

    const isImage = React.useMemo(() => {
      if (file.type !== 'file') return false;

      if (file.mimeType && file.mimeType.startsWith('image/')) {
        return true;
      }

      if (file.name) {
        const ext = file.name.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp', 'ico'].includes(ext);
      }

      return false;
    }, [file.type, file.mimeType, file.name]);

    React.useEffect(() => {
      if (!isImage || !file.id) {
        return undefined;
      }

      if (!accessToken) {
        return undefined;
      }

      let isMounted = true;
      let currentUrl = null;
      const controller = new AbortController();

      const fetchImage = async () => {
        setImageLoading(true);
        setImageError(false);

        try {
          const response = await fetch(`/api/files/${file.id}/download?inline=true`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }

          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          currentUrl = url;

          if (isMounted) {
            setImageUrl(url);
            setImageError(false);
            setImageLoading(false);
          }
        } catch (error) {
          if (error.name !== 'AbortError' && isMounted) {
            setImageError(true);
            setImageLoading(false);
          }
        }
      };

      fetchImage();

      return () => {
        isMounted = false;
        controller.abort();
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }
      };
    }, [isImage, file.id, file.name, accessToken]);

    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (file.type === 'folder' && !canRename && !canDelete && !canShare) {
        return;
      }
      if (onContextMenuChange) {
        onContextMenuChange({
          fileId: file.id,
          position: { x: e.clientX, y: e.clientY },
          file,
        });
      }
    };

    const handleCloseContextMenu = () => {
      if (onContextMenuChange) {
        onContextMenuChange(null);
      }
    };

    const isContextMenuOpen = contextMenuState?.fileId === file.id;

    return (
      <>
        <div
          role="button"
          tabIndex={0}
          className={`${styles.listRow} ${isSelected ? styles.selected : ''} ${
            isDragging ? styles.dragging : ''
          } ${isDropTarget ? styles.dropTarget : ''}`}
          onClick={onSelect}
          onDoubleClick={onDoubleClick}
          onContextMenu={handleContextMenu}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onDoubleClick();
            } else if (e.key === ' ') {
              e.preventDefault();
              onSelect();
            }
          }}
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className={styles.listCell} style={{ flex: 3 }}>
            {(() => {
              if (isImage && imageUrl && !imageError) {
                return (
                  <img
                    src={imageUrl}
                    alt={file.name}
                    style={{
                      width: '32px',
                      height: '32px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginRight: '8px',
                    }}
                  />
                );
              }

              if (isImage && imageLoading) {
                return <Icon name="spinner" loading size="large" style={{ marginRight: '8px' }} />;
              }

              return (
                <Icon
                  name={file.icon}
                  size="large"
                  color={file.type === 'folder' ? 'yellow' : undefined}
                />
              );
            })()}
            <span className={styles.listFileName}>{file.name}</span>
          </div>
          <div className={styles.listCell} style={{ flex: 1 }}>
            {file.formattedSize}
          </div>
          <div className={styles.listActions} />
        </div>
        {isContextMenuOpen && contextMenuState && (
          <FileContextMenu
            file={contextMenuState.file}
            position={contextMenuState.position}
            onClose={handleCloseContextMenu}
            onPreview={onPreview}
            onShare={onShare}
            onDownload={onDownload}
            onDelete={onDelete}
            onRename={onRename}
            canShare={canShare}
            canDelete={canDelete}
            canRename={canRename}
          />
        )}
      </>
    );
  },
);

FileListRow.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    mimeType: PropTypes.string,
    formattedSize: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  isDragging: PropTypes.bool.isRequired,
  isDropTarget: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onDragOver: PropTypes.func.isRequired,
  onDragLeave: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  onPreview: PropTypes.func,
  onShare: PropTypes.func,
  onDownload: PropTypes.func,
  onDelete: PropTypes.func,
  onRename: PropTypes.func,
  contextMenuState: PropTypes.shape({
    fileId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    position: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
    file: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      type: PropTypes.string,
    }),
  }),
  onContextMenuChange: PropTypes.func,
  canShare: PropTypes.bool,
  canDelete: PropTypes.bool,
  canRename: PropTypes.bool,
};

FileListRow.defaultProps = {
  onPreview: null,
  onShare: null,
  onDownload: null,
  onDelete: null,
  onRename: null,
  contextMenuState: null,
  onContextMenuChange: null,
  canShare: false,
  canDelete: false,
  canRename: false,
};

export default FileListRow;
