/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';

import styles from './FilePreviewModal.module.scss';

const FilePreviewModal = React.memo(({ file, files, onClose, onShare, onDownload }) => {
  const currentIndex = files.findIndex((f) => f.id === file.id);
  const totalFiles = files.length;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      // TODO: Navigate to previous file
    }
  };

  const handleNext = () => {
    if (currentIndex < totalFiles - 1) {
      // TODO: Navigate to next file
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
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className={styles.overlay} onClick={onClose}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Button icon className={styles.headerButton} onClick={onShare}>
              <Icon name="user plus" />
              Share
            </Button>
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
          {file.thumbnail ? (
            <div className={styles.imagePreview}>
              <Icon name="file image outline" size="massive" />
              <p className={styles.previewNote}>Image preview (mock)</p>
            </div>
          ) : (
            <div className={styles.filePreview}>
              <Icon name={file.icon} size="massive" color="yellow" />
              <p className={styles.fileType}>{file.type}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

FilePreviewModal.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    thumbnail: PropTypes.bool,
  }).isRequired,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onShare: PropTypes.func,
  onDownload: PropTypes.func,
};

FilePreviewModal.defaultProps = {
  onShare: () => {},
  onDownload: () => {},
};

export default FilePreviewModal;
