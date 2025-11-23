/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

import Paths from '../../../constants/Paths';
import styles from './SidebarNavigation.module.scss';

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
  }) => (
    <div className={styles.sidebarNav}>
      <div
        className={`${styles.sidebarItem} ${currentSection === 'all-files' && !currentFolderId ? styles.active : ''}`}
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
        >
          <Icon name="cloud upload" />
          <span>All Files</span>
        </div>
        <Icon
          name={allFilesExpanded ? 'caret down' : 'caret right'}
          className={styles.collapseIcon}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
        />
      </div>

      {allFilesExpanded &&
        currentSection === 'all-files' &&
        files
          .filter((f) => f.type === 'folder' && !f.parentId)
          .map((folder) => (
            <div
              key={folder.id}
              role="button"
              tabIndex={0}
              className={`${styles.sidebarItem} ${styles.indent} ${
                currentFolderId === folder.id ? styles.active : ''
              }`}
              onClick={() => onFolderClick(folder)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onFolderClick(folder);
                }
              }}
            >
              <div className={styles.sidebarItemContent}>
                <Icon name="folder outline" />
                <span>{folder.name}</span>
              </div>
            </div>
          ))}

      <div
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
          <span>Shared with me</span>
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
          <span>Recent</span>
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
          <span>Starred</span>
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
          <span>Trash</span>
        </div>
      </div>
    </div>
  ),
);

SidebarNavigation.propTypes = {
  currentSection: PropTypes.string.isRequired,
  currentFolderId: PropTypes.number,
  allFilesExpanded: PropTypes.bool.isRequired,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onSectionChange: PropTypes.func.isRequired,
  onBreadcrumbClick: PropTypes.func.isRequired,
  onFolderClick: PropTypes.func.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
};

SidebarNavigation.defaultProps = {
  currentFolderId: null,
};

export default SidebarNavigation;
