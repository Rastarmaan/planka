/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Icon } from 'semantic-ui-react';

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
  }) => (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.listRow} ${isSelected ? styles.selected : ''} ${
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
      <div className={styles.listCell} style={{ flex: 2 }}>
        <Icon name={file.icon} size="large" color={file.type === 'folder' ? 'yellow' : undefined} />
        <span className={styles.listFileName}>{file.name}</span>
      </div>
      <div className={styles.listCell} style={{ flex: 1 }}>
        {file.modified}
      </div>
      <div className={styles.listCell} style={{ flex: 0.5 }}>
        {file.size}
      </div>
      <div className={styles.listActions}>
        <Dropdown
          icon="ellipsis vertical"
          direction="left"
          className={styles.fileMenu}
          onClick={(e) => e.stopPropagation()}
        >
          <Dropdown.Menu>
            <Dropdown.Item icon="download" text="Download" />
            <Dropdown.Item icon="share alternate" text="Share" />
            <Dropdown.Item icon="pencil" text="Rename" />
            <Dropdown.Item icon="trash" text="Delete" />
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  ),
);

FileListRow.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    modified: PropTypes.string,
    size: PropTypes.string,
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

export default FileListRow;
