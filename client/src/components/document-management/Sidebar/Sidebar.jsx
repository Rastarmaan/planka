/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';

import UploadButton from './UploadButton';
import SidebarNavigation from './SidebarNavigation';
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
    onFileUpload,
    onSectionChange,
    onBreadcrumbClick,
    onFolderClick,
    onToggleExpand,
    onToggleWorkspacePopup,
    onSelectWorkspace,
    onRenameWorkspace,
    onDeleteWorkspace,
    onCreateWorkspace,
    draggedFile,
    dropTarget,
    onDragOver,
    onDragLeave,
    onDrop,
    canUpload,
    canManageWorkspaces,
    isAdmin,
    sharedSpaceIds,
  }) => (
    <div className={styles.sidebar}>
      {canUpload && (
        <UploadButton
          currentSection={currentSection}
          onFolderCreate={onFolderCreate}
          onFileUpload={onFileUpload}
        />
      )}

      <SidebarNavigation
        currentSection={currentSection}
        currentFolderId={currentFolderId}
        allFilesExpanded={allFilesExpanded}
        files={files}
        onSectionChange={onSectionChange}
        onBreadcrumbClick={onBreadcrumbClick}
        onFolderClick={onFolderClick}
        onToggleExpand={onToggleExpand}
        draggedFile={draggedFile}
        dropTarget={dropTarget}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        isAdmin={isAdmin}
      />

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
        canManageWorkspaces={canManageWorkspaces}
        isAdmin={isAdmin}
        sharedSpaceIds={sharedSpaceIds}
      />
    </div>
  ),
);

Sidebar.propTypes = {
  currentSection: PropTypes.string.isRequired,
  currentFolderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  allFilesExpanded: PropTypes.bool.isRequired,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      type: PropTypes.string,
    }),
  ).isRequired,
  workspaces: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      text: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  selectedWorkspace: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showWorkspacePopup: PropTypes.bool.isRequired,
  workspacePopupRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
  onFolderCreate: PropTypes.func.isRequired,
  onFileUpload: PropTypes.func.isRequired,
  onSectionChange: PropTypes.func.isRequired,
  onBreadcrumbClick: PropTypes.func.isRequired,
  onFolderClick: PropTypes.func.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
  onToggleWorkspacePopup: PropTypes.func.isRequired,
  onSelectWorkspace: PropTypes.func.isRequired,
  onRenameWorkspace: PropTypes.func.isRequired,
  onDeleteWorkspace: PropTypes.func.isRequired,
  onCreateWorkspace: PropTypes.func.isRequired,
  draggedFile: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
  }),
  dropTarget: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onDragOver: PropTypes.func,
  onDragLeave: PropTypes.func,
  onDrop: PropTypes.func,
  canUpload: PropTypes.bool,
  canManageWorkspaces: PropTypes.bool,
  isAdmin: PropTypes.bool,
  sharedSpaceIds: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
};

Sidebar.defaultProps = {
  currentFolderId: null,
  selectedWorkspace: null,
  draggedFile: null,
  dropTarget: null,
  onDragOver: null,
  onDragLeave: null,
  onDrop: null,
  canUpload: true,
  canManageWorkspaces: true,
  isAdmin: false,
  sharedSpaceIds: [],
};

export default Sidebar;
