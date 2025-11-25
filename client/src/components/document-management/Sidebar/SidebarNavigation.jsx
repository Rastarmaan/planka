/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';

import Paths from '../../../constants/Paths';
import styles from './SidebarNavigation.module.scss';

const FolderTree = React.memo(
  ({
    folder,
    currentFolderId,
    allFolders,
    onFolderClick,
    level = 0,
    draggedFile,
    dropTarget,
    onDragOver,
    onDragLeave,
    onDrop,
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const subFolders = allFolders.filter((f) => f.parentFolderId === folder.id);
    const hasChildren = subFolders.length > 0;
    const isDropTarget = dropTarget === folder.id;

    return (
      <>
        <div
          role="button"
          tabIndex={0}
          className={`${styles.sidebarItem} ${styles.indent} ${
            currentFolderId === folder.id ? styles.active : ''
          } ${isDropTarget ? styles.dropTarget : ''}`}
          style={{ paddingLeft: `${(level + 1) * 20}px` }}
          onClick={() => onFolderClick(folder)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onFolderClick(folder);
            }
          }}
          onDragOver={(e) => onDragOver && onDragOver(e, folder)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop && onDrop(e, folder)}
        >
          <div className={styles.sidebarItemContent}>
            {hasChildren && (
              <Icon
                name={isExpanded ? 'caret down' : 'caret right'}
                className={styles.expandIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              />
            )}
            <Icon name="folder outline" />
            <span>{folder.name}</span>
          </div>
        </div>
        {isExpanded &&
          hasChildren &&
          subFolders.map((subFolder) => (
            <FolderTree
              key={subFolder.id}
              folder={subFolder}
              currentFolderId={currentFolderId}
              allFolders={allFolders}
              onFolderClick={onFolderClick}
              level={level + 1}
              draggedFile={draggedFile}
              dropTarget={dropTarget}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            />
          ))}
      </>
    );
  },
);

FolderTree.propTypes = {
  folder: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    parentFolderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  currentFolderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  allFolders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      parentFolderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  onFolderClick: PropTypes.func.isRequired,
  level: PropTypes.number,
  draggedFile: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
  }),
  dropTarget: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onDragOver: PropTypes.func,
  onDragLeave: PropTypes.func,
  onDrop: PropTypes.func,
};

FolderTree.defaultProps = {
  currentFolderId: null,
  level: 0,
  draggedFile: null,
  dropTarget: null,
  onDragOver: null,
  onDragLeave: null,
  onDrop: null,
};

const SidebarNavigation = React.memo(
  ({
    currentSection,
    currentFolderId,
    allFilesExpanded,
    files,
    onSectionChange,
    onBreadcrumbClick,
    onFolderClick,
    onToggleExpand,
    draggedFile,
    dropTarget,
    onDragOver,
    onDragLeave,
    onDrop,
    isAdmin,
  }) => {
    const [t] = useTranslation();

    return (
      <div className={styles.sidebarNav}>
        <div
          className={`${styles.sidebarItem} ${currentSection === 'all-files' && !currentFolderId ? styles.active : ''} ${dropTarget === 'root' ? styles.dropTarget : ''}`}
        >
          <div
            role="button"
            tabIndex={0}
            className={styles.sidebarItemContent}
            onClick={() => {
              onBreadcrumbClick(-1);
              onSectionChange(Paths.DOCUMENT_ALL_FILES);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onBreadcrumbClick(-1);
                onSectionChange(Paths.DOCUMENT_ALL_FILES);
              }
            }}
            onDragOver={(e) => {
              if (onDragOver && draggedFile) {
                e.preventDefault();
                onDragOver(e, { id: 'root', type: 'folder', name: 'root' });
              }
            }}
            onDragLeave={onDragLeave}
            onDrop={(e) => {
              if (onDrop && draggedFile) {
                onDrop(e, { id: 'root', type: 'folder', name: 'root' });
              }
            }}
          >
            <Icon
              name={allFilesExpanded ? 'caret down' : 'caret right'}
              className={styles.collapseIcon}
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
            />
            <Icon name="cloud upload" />
            <span>{t('documentManagement.allFiles')}</span>
          </div>
        </div>

        {allFilesExpanded &&
          currentSection === 'all-files' &&
          files
            .filter((f) => f.type === 'folder' && !f.parentFolderId)
            .map((folder) => (
              <FolderTree
                key={folder.id}
                folder={folder}
                currentFolderId={currentFolderId}
                allFolders={files.filter((f) => f.type === 'folder')}
                onFolderClick={onFolderClick}
                draggedFile={draggedFile}
                dropTarget={dropTarget}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              />
            ))}

        {/* <div
        role="button"
        tabIndex={0}
        className={`${styles.sidebarItem} ${currentSection === 'shared' ? styles.active : ''}`}
        onClick={() => onSectionChange(Paths.DOCUMENT_SHARED)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSectionChange(Paths.DOCUMENT_SHARED);
          }
        }}
      >
        <div className={styles.sidebarItemContent}>
          <Icon name="users" />
          <span>{t('documentManagement.shared')}</span>
        </div>
      </div>
      <div
        role="button"
        tabIndex={0}
        className={`${styles.sidebarItem} ${currentSection === 'recent' ? styles.active : ''}`}
        onClick={() => onSectionChange(Paths.DOCUMENT_RECENT)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSectionChange(Paths.DOCUMENT_RECENT);
          }
        }}
      >
        <div className={styles.sidebarItemContent}>
          <Icon name="clock outline" />
          <span>{t('documentManagement.recent')}</span>
        </div>
      </div>
      <div
        role="button"
        tabIndex={0}
        className={`${styles.sidebarItem} ${currentSection === 'starred' ? styles.active : ''}`}
        onClick={() => onSectionChange(Paths.DOCUMENT_STARRED)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSectionChange(Paths.DOCUMENT_STARRED);
          }
        }}
      >
        <div className={styles.sidebarItemContent}>
          <Icon name="star outline" />
          <span>{t('documentManagement.starred')}</span>
        </div>
      </div>
      <div
        role="button"
        tabIndex={0}
        className={`${styles.sidebarItem} ${currentSection === 'trash' ? styles.active : ''}`}
        onClick={() => onSectionChange(Paths.DOCUMENT_TRASH)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSectionChange(Paths.DOCUMENT_TRASH);
          }
        }}
      >
        <div className={styles.sidebarItemContent}>
          <Icon name="trash alternate outline" />
          <span>{t('documentManagement.trash')}</span>
        </div>
      </div> */}

        {isAdmin && (
          <div
            role="button"
            tabIndex={0}
            className={`${styles.sidebarItem} ${currentSection === 'activity' ? styles.active : ''}`}
            onClick={() => onSectionChange(Paths.DOCUMENT_ACTIVITY)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSectionChange(Paths.DOCUMENT_ACTIVITY);
              }
            }}
          >
            <div className={styles.sidebarItemContent}>
              <Icon name="history" />
              <span>{t('documentManagement.activityLog', 'Activity Log')}</span>
            </div>
          </div>
        )}
      </div>
    );
  },
);

SidebarNavigation.propTypes = {
  currentSection: PropTypes.string.isRequired,
  currentFolderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  allFilesExpanded: PropTypes.bool.isRequired,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onSectionChange: PropTypes.func.isRequired,
  onBreadcrumbClick: PropTypes.func.isRequired,
  onFolderClick: PropTypes.func.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
  draggedFile: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
  }),
  dropTarget: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onDragOver: PropTypes.func,
  onDragLeave: PropTypes.func,
  onDrop: PropTypes.func,
  isAdmin: PropTypes.bool,
};

SidebarNavigation.defaultProps = {
  currentFolderId: null,
  draggedFile: null,
  dropTarget: null,
  onDragOver: null,
  onDragLeave: null,
  onDrop: null,
  isAdmin: false,
};

export default SidebarNavigation;
