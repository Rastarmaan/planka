/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import selectors from '../../../selectors';

import styles from './FilePreviewModal.module.scss';

const FilePreviewModal = React.memo(
  ({ file, files, onClose, onShare, onDownload, onNavigate, canShare }) => {
    const accessToken = useSelector(selectors.selectAccessToken);
    const [imageUrl, setImageUrl] = React.useState(null);
    const [imageError, setImageError] = React.useState(false);
    const [imageLoading, setImageLoading] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

    const imageFiles = files.filter(
      (f) => f.type === 'file' && f.mimeType && f.mimeType.startsWith('image/'),
    );
    const currentIndex = imageFiles.findIndex((f) => f.id === file.id);
    const totalFiles = imageFiles.length;

    const handlePrevious = () => {
      if (currentIndex > 0) {
        onNavigate(imageFiles[currentIndex - 1]);
      }
    };

    const handleNext = () => {
      if (currentIndex < totalFiles - 1) {
        onNavigate(imageFiles[currentIndex + 1]);
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    React.useEffect(() => {
      if (!file.mimeType || !file.mimeType.startsWith('image/') || !file.id || !accessToken) {
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
            throw new Error('Server returned HTML error page');
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
    }, [file.id, file.mimeType, file.name, accessToken]);

    React.useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      document.addEventListener('keydown', handleKeyPress);
      window.addEventListener('resize', handleResize);

      return () => {
        document.removeEventListener('keydown', handleKeyPress);
        window.removeEventListener('resize', handleResize);
      };
    }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div className={styles.overlay} onClick={onClose}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              {canShare && (
                <Button icon className={styles.headerButton} onClick={onShare}>
                  <Icon name="user plus" />
                  Share
                </Button>
              )}
              <Button icon className={styles.headerButton} onClick={onDownload}>
                <Icon name="download" />
                Download
              </Button>
            </div>

            <div className={styles.headerCenter}>
              <Icon name="file image outline" className={styles.fileIcon} />
              <span className={styles.fileName}>{file.name}</span>
            </div>

            <div className={styles.headerRight}>
              <Button
                icon
                className={styles.iconButton}
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <Icon name="angle left" />
              </Button>
              <span className={styles.pageInfo}>
                {currentIndex + 1} / {totalFiles}
              </span>
              <Button
                icon
                className={styles.iconButton}
                onClick={handleNext}
                disabled={currentIndex === totalFiles - 1}
              >
                <Icon name="angle right" />
              </Button>
              <Button icon className={styles.iconButton} onClick={onClose}>
                <Icon name="close" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {file.mimeType && file.mimeType.startsWith('image/') ? (
              <div className={styles.imagePreview}>
                {(() => {
                  if (imageLoading) {
                    return <Icon name="spinner" loading size="massive" />;
                  }

                  if (imageUrl && !imageError) {
                    return (
                      <img
                        src={imageUrl}
                        alt={file.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: isMobile ? 'calc(100vh - 140px)' : 'calc(100vh - 80px)',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                        }}
                      />
                    );
                  }

                  if (imageError) {
                    return (
                      <div className={styles.errorMessage}>
                        <Icon name="warning circle" size="massive" color="red" />
                        <p>Failed to load image</p>
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>
            ) : (
              <div className={styles.filePreview}>
                <Icon name={file.icon} size="massive" color="yellow" />
                <p className={styles.fileType}>{file.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

FilePreviewModal.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    mimeType: PropTypes.string,
  }).isRequired,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string,
      mimeType: PropTypes.string,
    }),
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onShare: PropTypes.func,
  onDownload: PropTypes.func,
  onNavigate: PropTypes.func.isRequired,
  canShare: PropTypes.bool,
};

FilePreviewModal.defaultProps = {
  onShare: () => {},
  onDownload: () => {},
  canShare: false,
};

export default FilePreviewModal;
