/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import selectors from '../../../selectors';

import styles from './FileCard.module.scss';

const FileCard = React.memo(
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

          if (blob.type.includes('text/html')) {
            throw new Error('Server returned HTML error page instead of image');
          }

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

    return (
      <div
        role="button"
        tabIndex={0}
        className={`${styles.fileCard} ${isSelected ? styles.selected : ''} ${
          isDragging ? styles.dragging : ''
        } ${isDropTarget ? styles.dropTarget : ''}`}
        onClick={onSelect}
        onDoubleClick={onDoubleClick}
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
        <div className={styles.fileIcon}>
          {(() => {
            if (isImage && !imageError && imageUrl) {
              return (
                <div className={styles.fileThumbnail}>
                  <img
                    src={imageUrl}
                    alt={file.name}
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px',
                    }}
                  />
                </div>
              );
            }

            if (isImage && imageLoading) {
              return <Icon name="spinner" loading size="huge" />;
            }

            return (
              <Icon
                name={file.icon}
                size="huge"
                color={file.type === 'folder' ? 'yellow' : undefined}
              />
            );
          })()}
        </div>
        <div className={styles.fileName}>{file.name}</div>
      </div>
    );
  },
);

FileCard.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    mimeType: PropTypes.string,
    thumbnail: PropTypes.bool,
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
};

export default FileCard;
