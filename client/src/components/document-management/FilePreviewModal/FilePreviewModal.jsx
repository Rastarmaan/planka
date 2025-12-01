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
    const [mediaUrl, setMediaUrl] = React.useState(null);
    const [mediaError, setMediaError] = React.useState(false);
    const [mediaLoading, setMediaLoading] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

    const isImage = file.mimeType && file.mimeType.startsWith('image/');
    const isVideo = file.mimeType && file.mimeType.startsWith('video/');

    const previewableFiles = files.filter(
      (f) =>
        f.type === 'file' &&
        f.mimeType &&
        (f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/')),
    );
    const currentIndex = previewableFiles.findIndex((f) => f.id === file.id);
    const totalFiles = previewableFiles.length;

    const handlePrevious = () => {
      if (currentIndex > 0) {
        onNavigate(previewableFiles[currentIndex - 1]);
      }
    };

    const handleNext = () => {
      if (currentIndex < totalFiles - 1) {
        onNavigate(previewableFiles[currentIndex + 1]);
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
      if (!file.mimeType || (!isImage && !isVideo) || !file.id || !accessToken) {
        return undefined;
      }

      let isMounted = true;
      let currentUrl = null;
      const controller = new AbortController();

      const fetchMedia = async () => {
        setMediaLoading(true);
        setMediaError(false);

        try {
          const response = await fetch(`/api/files/${file.id}/download?inline=true`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch media: ${response.status}`);
          }

          const blob = await response.blob();

          if (blob.type.includes('text/html')) {
            throw new Error('Server returned HTML error page');
          }

          const url = URL.createObjectURL(blob);
          currentUrl = url;

          if (isMounted) {
            setMediaUrl(url);
            setMediaError(false);
            setMediaLoading(false);
          }
        } catch (error) {
          if (error.name !== 'AbortError' && isMounted) {
            setMediaError(true);
            setMediaLoading(false);
          }
        }
      };

      fetchMedia();

      return () => {
        isMounted = false;
        controller.abort();
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }
      };
    }, [file.id, file.mimeType, file.name, accessToken, isImage, isVideo]);

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
              <Icon
                name={isVideo ? 'file video outline' : 'file image outline'}
                className={styles.fileIcon}
              />
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
            {isImage && (
              <div className={styles.imagePreview}>
                {(() => {
                  if (mediaLoading) {
                    return <Icon name="spinner" loading size="massive" />;
                  }

                  if (mediaUrl && !mediaError) {
                    const maxHeight = isMobile ? 'calc(100vh - 140px)' : 'calc(100vh - 80px)';
                    return (
                      <img
                        src={mediaUrl}
                        alt={file.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight,
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                        }}
                      />
                    );
                  }

                  if (mediaError) {
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
            )}
            {isVideo && (
              <div className={styles.videoPreview}>
                {(() => {
                  if (mediaLoading) {
                    return <Icon name="spinner" loading size="massive" />;
                  }

                  if (mediaUrl && !mediaError) {
                    const maxHeight = isMobile ? 'calc(100vh - 140px)' : 'calc(100vh - 80px)';
                    return (
                      // eslint-disable-next-line jsx-a11y/media-has-caption
                      <video
                        src={mediaUrl}
                        controls
                        autoPlay
                        style={{
                          maxWidth: '100%',
                          maxHeight,
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                        }}
                      />
                    );
                  }

                  if (mediaError) {
                    return (
                      <div className={styles.errorMessage}>
                        <Icon name="warning circle" size="massive" color="red" />
                        <p>Failed to load video</p>
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>
            )}
            {!isImage && !isVideo && (
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
