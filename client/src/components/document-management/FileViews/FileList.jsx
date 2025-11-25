/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import FileListRow from './FileListRow';
import styles from './FileList.module.scss';

const FileList = React.memo(
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
    onExternalDrop,
    onPreview,
    onShare,
    onDownload,
    onDelete,
    canShare,
    canDelete,
  }) => {
    const [t] = useTranslation();
    const [activeContextMenu, setActiveContextMenu] = React.useState(null);

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onExternalDrop(e.dataTransfer.files);
      }
    };

    return (
      <div className={styles.filesList} onDragOver={handleDragOver} onDrop={handleDrop}>
        <div className={styles.listHeader}>
          <div className={styles.listHeaderCell} style={{ flex: 3 }}>
            {t('common.name')}
          </div>
          <div className={styles.listHeaderCell} style={{ flex: 1 }}>
            {t('common.size')}
          </div>
          <div className={styles.listHeaderActions} />
        </div>
        {files.map((file) => (
          <FileListRow
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
            onPreview={onPreview}
            onShare={onShare}
            onDownload={onDownload}
            onDelete={onDelete}
            contextMenuState={activeContextMenu}
            onContextMenuChange={setActiveContextMenu}
            canShare={canShare}
            canDelete={canDelete}
          />
        ))}
      </div>
    );
  },
);

FileList.propTypes = {
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
  onExternalDrop: PropTypes.func.isRequired,
  onPreview: PropTypes.func,
  onShare: PropTypes.func,
  onDownload: PropTypes.func,
  onDelete: PropTypes.func,
  canShare: PropTypes.bool,
  canDelete: PropTypes.bool,
};

FileList.defaultProps = {
  selectedFile: null,
  draggedFile: null,
  dropTarget: null,
  onPreview: null,
  onShare: null,
  onDownload: null,
  onDelete: null,
  canShare: false,
  canDelete: false,
};

export default FileList;
