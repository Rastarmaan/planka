/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

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
  }) => (
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
      draggable={file.type !== 'folder'}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className={styles.fileIcon}>
        {file.thumbnail ? (
          <div className={styles.fileThumbnail}>
            <Icon name={file.icon} size="huge" />
          </div>
        ) : (
          <Icon
            name={file.icon}
            size="huge"
            color={file.type === 'folder' ? 'yellow' : undefined}
          />
        )}
      </div>
      <div className={styles.fileName}>{file.name}</div>
    </div>
  ),
);

FileCard.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
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
