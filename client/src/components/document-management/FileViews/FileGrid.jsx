/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

import FileCard from './FileCard';
import styles from './FileGrid.module.scss';

const FileGrid = React.memo(
  ({
    files,
    selectedFile,
    draggedFile,
    dropTarget,
    onFileSelect,
    onFolderDoubleClick,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
  }) => (
    <div className={styles.filesGrid}>
      {files.length === 0 ? (
        <div className={styles.emptyState}>
          <Icon name="file outline" size="massive" className={styles.emptyIcon} />
          <h3>Drop files or folders here</h3>
          <p>Or use the &quot;Upload&quot; button</p>
        </div>
      ) : (
        files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            isSelected={selectedFile === file.id}
            isDragging={draggedFile?.id === file.id}
            isDropTarget={dropTarget === file.id}
            onSelect={() => onFileSelect(file.id)}
            onDoubleClick={() => onFolderDoubleClick(file)}
            onDragStart={(e) => onDragStart(e, file)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => onDragOver(e, file)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, file)}
          />
        ))
      )}
    </div>
  ),
);

FileGrid.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  selectedFile: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  draggedFile: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
  dropTarget: PropTypes.number,
  onFileSelect: PropTypes.func.isRequired,
  onFolderDoubleClick: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onDragOver: PropTypes.func.isRequired,
  onDragLeave: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
};

FileGrid.defaultProps = {
  selectedFile: null,
  draggedFile: null,
  dropTarget: null,
};

export default FileGrid;
