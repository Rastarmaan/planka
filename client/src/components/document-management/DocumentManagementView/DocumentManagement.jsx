/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Paths from '../../../constants/Paths';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';
import SortBar from '../TopBar/SortBar';
import FileGrid from '../FileViews/FileGrid';
import FileList from '../FileViews/FileList';
import FilePreviewModal from '../FilePreviewModal/FilePreviewModal';
import InputModal from '../InputModal/InputModal';
import styles from './DocumentManagement.module.scss';

const DocumentManagement = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const workspacePopupRef = useRef(null);

  // State
  const [selectedWorkspace, setSelectedWorkspace] = useState('default');
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('modified');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [modalConfig, setModalConfig] = useState(null);
  const [showWorkspacePopup, setShowWorkspacePopup] = useState(false);
  const [draggedFile, setDraggedFile] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [allFilesExpanded, setAllFilesExpanded] = useState(true);

  // Get current section from URL
  const currentSection = location.pathname.split('/').pop() || 'all-files';

  // Mock data
  const workspaces = [
    {
      key: 'default',
      text: 'Default',
      value: 'default',
      description: 'Personal workspace',
      selected: true,
    },
    {
      key: 'space2',
      text: 'space2',
      value: 'space2',
      description: '1 members',
    },
  ];

  const files = [
    {
      id: 1,
      name: 'Untitled Folder',
      type: 'folder',
      icon: 'folder',
      modified: 'Nov 22, 2025',
      size: '57 KB',
      parentId: null,
    },
    {
      id: 2,
      name: 'Screenshot_20251110_164438_Digikala.jpg',
      type: 'file',
      icon: 'file image',
      modified: 'Nov 14, 2025',
      size: '208 KB',
      thumbnail: true,
      parentId: null,
    },
    {
      id: 3,
      name: 'me2.webp',
      type: 'file',
      icon: 'file image',
      modified: 'Nov 22, 2025',
      size: '150 KB',
      thumbnail: true,
      parentId: null,
    },
  ];

  // Helper functions
  const getSectionTitle = () => {
    switch (currentSection) {
      case 'all-files':
        return 'All Files';
      case 'shared':
        return 'Shared with me';
      case 'recent':
        return 'Recent';
      case 'starred':
        return 'Starred';
      case 'trash':
        return 'Trash';
      default:
        return 'All Files';
    }
  };

  const getFilteredFiles = () => {
    const baseFiles = currentFolderId
      ? files.filter((f) => f.parentId === currentFolderId)
      : files.filter((f) => !f.parentId);

    if (currentSection !== 'all-files') {
      return baseFiles.filter((f) => f.type !== 'folder');
    }

    return baseFiles;
  };

  const handleSectionChange = (path) => {
    const targetSection = path.split('/').pop();
    if (targetSection !== 'all-files') {
      setCurrentFolderId(null);
      setCurrentPath([]);
    }
    navigate(path);
  };

  // Redirect to all-files if on base document-management path
  useEffect(() => {
    if (location.pathname === Paths.DOCUMENT_MANAGEMENT) {
      navigate(Paths.DOCUMENT_ALL_FILES, { replace: true });
    }
  }, [location.pathname, navigate]);

  // Close workspace popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (workspacePopupRef.current && !workspacePopupRef.current.contains(event.target)) {
        setShowWorkspacePopup(false);
      }
    };

    if (showWorkspacePopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWorkspacePopup]);

  // File operations
  const handleFileSelect = (fileId) => {
    setSelectedFile((prev) => (prev === fileId ? null : fileId));
  };

  const handleFolderDoubleClick = (folder) => {
    if (folder.type === 'folder') {
      const folderIndex = currentPath.findIndex((p) => p.id === folder.id);

      if (folderIndex !== -1) {
        const newPath = currentPath.slice(0, folderIndex + 1);
        setCurrentPath(newPath);
        setCurrentFolderId(folder.id);
      } else {
        setCurrentFolderId(folder.id);
        setCurrentPath([...currentPath, { id: folder.id, name: folder.name }]);
      }

      setSelectedFile(null);
    }
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setCurrentFolderId(null);
      setCurrentPath([]);
    } else {
      const newPath = currentPath.slice(0, index + 1);
      setCurrentPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1].id);
    }
    setSelectedFile(null);
  };

  const handleDeleteSelected = () => {
    // TODO: Implement delete functionality
    setSelectedFile(null);
  };

  const handlePreview = () => {
    const file = files.find((f) => f.id === selectedFile);
    if (file) {
      setPreviewFile(file);
    }
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
  };

  const handleCreateFolder = (/* folderName */) => {
    // TODO: Implement create folder functionality
  };

  const handleCreateWorkspace = (/* workspaceName */) => {
    // TODO: Implement create workspace functionality
  };

  const handleRenameWorkspace = (/* newName */) => {
    // TODO: Implement rename workspace functionality
  };

  const handleDeleteWorkspace = (/* workspaceValue */) => {
    // TODO: Implement delete workspace functionality
    setShowWorkspacePopup(false);
  };

  // Drag and drop operations
  const handleDragStart = (e, file) => {
    if (file.type !== 'folder') {
      setDraggedFile(file);
    }
  };

  const handleDragEnd = () => {
    setDraggedFile(null);
    setDropTarget(null);
  };

  const handleDragOver = (e, folder) => {
    e.preventDefault();
    if (draggedFile && folder.type === 'folder') {
      setDropTarget(folder.id);
    }
  };

  const handleDragLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setDropTarget(null);
    }
  };

  const handleDrop = (e, folder) => {
    e.preventDefault();
    if (draggedFile && folder.type === 'folder') {
      // TODO: Implement move file to folder functionality
    }
    setDraggedFile(null);
    setDropTarget(null);
  };

  // Modal operations
  const openFolderModal = () => {
    setModalConfig({
      type: 'folder',
      title: 'New Folder',
      label: 'Folder name',
      defaultValue: 'Untitled Folder',
      submitLabel: 'Create',
      onSubmit: handleCreateFolder,
    });
  };

  const openWorkspaceCreateModal = () => {
    setModalConfig({
      type: 'workspace-create',
      title: 'Create workspace',
      label: 'Workspace name',
      defaultValue: '',
      submitLabel: 'Create',
      onSubmit: handleCreateWorkspace,
    });
  };

  const openWorkspaceRenameModal = (workspaceName) => {
    setModalConfig({
      type: 'workspace-rename',
      title: 'Rename workspace',
      label: 'Workspace name',
      defaultValue: workspaceName,
      submitLabel: 'Rename',
      onSubmit: handleRenameWorkspace,
    });
  };

  const openWorkspaceDeleteModal = (workspaceValue) => {
    setModalConfig({
      type: 'workspace-delete',
      title: 'Delete workspace',
      label: 'Type the workspace name to confirm',
      defaultValue: '',
      submitLabel: 'Delete',
      onSubmit: () => handleDeleteWorkspace(workspaceValue),
    });
  };

  const currentFiles = getFilteredFiles();
  const sectionTitle = getSectionTitle();

  return (
    <div className={styles.wrapper}>
      {/* Sidebar */}
      <Sidebar
        currentSection={currentSection}
        currentFolderId={currentFolderId}
        allFilesExpanded={allFilesExpanded}
        files={files}
        workspaces={workspaces}
        selectedWorkspace={selectedWorkspace}
        showWorkspacePopup={showWorkspacePopup}
        workspacePopupRef={workspacePopupRef}
        onFolderCreate={openFolderModal}
        onSectionChange={handleSectionChange}
        onBreadcrumbClick={handleBreadcrumbClick}
        onFolderClick={handleFolderDoubleClick}
        onToggleExpand={() => setAllFilesExpanded(!allFilesExpanded)}
        onToggleWorkspacePopup={() => setShowWorkspacePopup(!showWorkspacePopup)}
        onSelectWorkspace={(value) => {
          setSelectedWorkspace(value);
          setShowWorkspacePopup(false);
        }}
        onRenameWorkspace={(e, workspace) => {
          e.stopPropagation();
          openWorkspaceRenameModal(workspace.text);
          setShowWorkspacePopup(false);
        }}
        onDeleteWorkspace={(e, workspace) => {
          e.stopPropagation();
          openWorkspaceDeleteModal(workspace.value);
          setShowWorkspacePopup(false);
        }}
        onCreateWorkspace={() => {
          openWorkspaceCreateModal();
          setShowWorkspacePopup(false);
        }}
      />

      {/* Input Modal */}
      {modalConfig && (
        <InputModal
          title={modalConfig.title}
          label={modalConfig.label}
          defaultValue={modalConfig.defaultValue}
          submitLabel={modalConfig.submitLabel}
          onSubmit={modalConfig.onSubmit}
          onClose={() => setModalConfig(null)}
        />
      )}

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Top Bar */}
        <TopBar
          sectionTitle={sectionTitle}
          currentPath={currentPath}
          view={view}
          onBreadcrumbClick={handleBreadcrumbClick}
          onFolderCreate={openFolderModal}
          onViewChange={setView}
        />

        {/* Sort Bar */}
        <SortBar
          sortBy={sortBy}
          selectedFile={selectedFile}
          onSortChange={setSortBy}
          onPreview={handlePreview}
          onDelete={handleDeleteSelected}
        />

        {/* Files Grid or List */}
        {view === 'grid' ? (
          <FileGrid
            files={currentFiles}
            selectedFile={selectedFile}
            draggedFile={draggedFile}
            dropTarget={dropTarget}
            onFileSelect={handleFileSelect}
            onFolderDoubleClick={handleFolderDoubleClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
        ) : (
          <FileList
            files={currentFiles}
            selectedFile={selectedFile}
            draggedFile={draggedFile}
            dropTarget={dropTarget}
            onFileSelect={handleFileSelect}
            onFolderDoubleClick={handleFolderDoubleClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
        )}
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          files={files}
          onClose={handleClosePreview}
          onShare={handleShare}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
});

export default DocumentManagement;
