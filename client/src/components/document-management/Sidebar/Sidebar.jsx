/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';

import UploadButton from './UploadButton';
import SidebarNavigation from './SidebarNavigation';
import StorageInfo from './StorageInfo';
import WorkspaceSelector from './WorkspaceSelector';
import styles from './Sidebar.module.scss';

const Sidebar = React.memo(
  ({
    currentSection,
    currentFolderId,
    allFilesExpanded,
    files,
    workspaces,
    selectedWorkspace,
    showWorkspacePopup,
    workspacePopupRef,
    onFolderCreate,
    onSectionChange,
    onBreadcrumbClick,
    onFolderClick,
    onToggleExpand,
    onToggleWorkspacePopup,
    onSelectWorkspace,
    onRenameWorkspace,
    onDeleteWorkspace,
    onCreateWorkspace,
  }) => (
    <div className={styles.sidebar}>
      <UploadButton currentSection={currentSection} onFolderCreate={onFolderCreate} />

      <SidebarNavigation
        currentSection={currentSection}
        currentFolderId={currentFolderId}
        allFilesExpanded={allFilesExpanded}
        files={files}
        onSectionChange={onSectionChange}
        onBreadcrumbClick={onBreadcrumbClick}
        onFolderClick={onFolderClick}
        onToggleExpand={onToggleExpand}
      />

      <StorageInfo />

      <WorkspaceSelector
        workspaces={workspaces}
        selectedWorkspace={selectedWorkspace}
        showWorkspacePopup={showWorkspacePopup}
        workspacePopupRef={workspacePopupRef}
        onTogglePopup={onToggleWorkspacePopup}
        onSelectWorkspace={onSelectWorkspace}
        onRenameWorkspace={onRenameWorkspace}
        onDeleteWorkspace={onDeleteWorkspace}
        onCreateWorkspace={onCreateWorkspace}
      />
    </div>
  ),
);

Sidebar.propTypes = {
  currentSection: PropTypes.string.isRequired,
  currentFolderId: PropTypes.number,
  allFilesExpanded: PropTypes.bool.isRequired,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      type: PropTypes.string,
    }),
  ).isRequired,
  workspaces: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      text: PropTypes.string,
      value: PropTypes.string,
    }),
  ).isRequired,
  selectedWorkspace: PropTypes.string.isRequired,
  showWorkspacePopup: PropTypes.bool.isRequired,
  workspacePopupRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
  onFolderCreate: PropTypes.func.isRequired,
  onSectionChange: PropTypes.func.isRequired,
  onBreadcrumbClick: PropTypes.func.isRequired,
  onFolderClick: PropTypes.func.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
  onToggleWorkspacePopup: PropTypes.func.isRequired,
  onSelectWorkspace: PropTypes.func.isRequired,
  onRenameWorkspace: PropTypes.func.isRequired,
  onDeleteWorkspace: PropTypes.func.isRequired,
  onCreateWorkspace: PropTypes.func.isRequired,
};

Sidebar.defaultProps = {
  currentFolderId: null,
};

export default Sidebar;
