/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Confirm } from 'semantic-ui-react';

import actions from '../../../actions';
import api from '../../../api';
import selectors, {
  makeSelectSpaces,
  makeSelectFoldersBySpaceId,
  makeSelectFilesBySpaceId,
} from '../../../selectors';
import { createLocalId } from '../../../utils/local-id';
import Paths from '../../../constants/Paths';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';
import SortBar from '../TopBar/SortBar';
import FileGrid from '../FileViews/FileGrid';
import FileList from '../FileViews/FileList';
import FilePreviewModal from '../FilePreviewModal/FilePreviewModal';
import ShareModal from '../ShareModal/ShareModal';
import InputModal from '../InputModal/InputModal';
import styles from './DocumentManagement.module.scss';

const DocumentManagement = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const workspacePopupRef = useRef(null);
  const pendingWorkspaceRef = useRef(null);

  const selectSpaces = useMemo(makeSelectSpaces, []);
  const spaces = useSelector(selectSpaces);
  const accessToken = useSelector(selectors.selectAccessToken);

  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('modified');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState(null);
  const [modalConfig, setModalConfig] = useState(null);
  const [showWorkspacePopup, setShowWorkspacePopup] = useState(false);
  const [deleteConfirmWorkspace, setDeleteConfirmWorkspace] = useState(null);
  const [draggedFile, setDraggedFile] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [allFilesExpanded, setAllFilesExpanded] = useState(true);

  const selectFolders = useMemo(makeSelectFoldersBySpaceId, []);
  const selectFiles = useMemo(makeSelectFilesBySpaceId, []);

  const folders = useSelector((state) => selectFolders(state, selectedWorkspace));
  const filesList = useSelector((state) => selectFiles(state, selectedWorkspace));

  const getFileIcon = useCallback((filename) => {
    if (!filename) return 'file outline';
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'file pdf';
      case 'doc':
      case 'docx':
        return 'file word';
      case 'xls':
      case 'xlsx':
        return 'file excel';
      case 'ppt':
      case 'pptx':
        return 'file powerpoint';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return 'file image';
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return 'file archive';
      case 'txt':
      case 'md':
        return 'file text';
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'html':
      case 'css':
      case 'json':
      case 'xml':
      case 'yml':
      case 'yaml':
        return 'file code';
      case 'mp3':
      case 'wav':
      case 'ogg':
        return 'file audio';
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
        return 'file video';
      default:
        return 'file outline';
    }
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (!bytes || bytes === '0') return '-';
    const size = parseInt(bytes, 10);
    if (size === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return `${parseFloat((size / k ** i).toFixed(2))} ${sizes[i]}`;
  }, []);

  const files = useMemo(() => {
    return [
      ...folders.map((f) => ({ ...f, type: 'folder', icon: 'folder', formattedSize: '-' })),
      ...filesList.map((f) => ({
        ...f,
        type: 'file',
        icon: getFileIcon(f.name),
        formattedSize: formatFileSize(f.size),
      })),
    ];
  }, [folders, filesList, getFileIcon, formatFileSize]);

  useEffect(() => {
    dispatch(actions.fetchSpaces());
  }, [dispatch]);

  const prevSpaceIdsRef = useRef([]);

  useEffect(() => {
    if (spaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(spaces[0].id);
    }
  }, [spaces, selectedWorkspace]);

  useEffect(() => {
    const currentIds = spaces.map((s) => s.id);
    const newIds = currentIds.filter((id) => !prevSpaceIdsRef.current.includes(id));

    if (newIds.length > 0 && pendingWorkspaceRef.current) {
      const localIdStillExists = currentIds.includes(pendingWorkspaceRef.current);

      if (!localIdStillExists) {
        setSelectedWorkspace(newIds[0]);
        pendingWorkspaceRef.current = null;
      }
    }

    prevSpaceIdsRef.current = currentIds;
  }, [spaces]);

  useEffect(() => {
    if (selectedWorkspace && !pendingWorkspaceRef.current) {
      const workspaceExists = spaces.find((s) => s.id === selectedWorkspace);
      if (workspaceExists) {
        dispatch(actions.fetchFolders(selectedWorkspace));
      }
    }
  }, [dispatch, selectedWorkspace, spaces]);

  useEffect(() => {
    if (currentFolderId) {
      dispatch(actions.fetchFolder(currentFolderId));
    }
  }, [dispatch, currentFolderId]);

  useEffect(() => {
    if (spaces.length > 0) {
      if (selectedWorkspace && !spaces.find((s) => s.id === selectedWorkspace)) {
        setSelectedWorkspace(spaces[0].id);
        setCurrentFolderId(null);
        setCurrentPath([]);
      }
    }
  }, [spaces, selectedWorkspace]);

  const currentSection = location.pathname.split('/').pop() || 'all-files';

  const workspaces = useMemo(
    () =>
      spaces.map((space) => ({
        key: space.id,
        text: space.name,
        value: space.id,
        description: space.description,
        selected: space.id === selectedWorkspace,
      })),
    [spaces, selectedWorkspace],
  );

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
      ? files.filter((f) => {
          if (f.type === 'folder') {
            return f.parentFolderId === currentFolderId;
          }
          return f.folderId === currentFolderId;
        })
      : files.filter((f) => {
          if (f.type === 'folder') {
            return !f.parentFolderId || f.parentFolderId === null;
          }
          return !f.folderId || f.folderId === null;
        });

    let filteredFiles = baseFiles;
    if (currentSection !== 'all-files') {
      filteredFiles = baseFiles.filter((f) => f.type !== 'folder');
    }

    return filteredFiles.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');

        case 'size': {
          if (a.type === 'folder' && b.type === 'folder') {
            return (a.name || '').localeCompare(b.name || '');
          }
          if (a.type === 'folder') return -1;
          if (b.type === 'folder') return 1;
          const sizeA = parseInt(a.size || '0', 10);
          const sizeB = parseInt(b.size || '0', 10);
          return sizeB - sizeA;
        }

        case 'modified':
        default: {
          const dateA = new Date(a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.updatedAt || b.createdAt || 0);
          return dateB - dateA;
        }
      }
    });
  };

  const handleSectionChange = (path) => {
    const targetSection = path.split('/').pop();
    if (targetSection !== 'all-files') {
      setCurrentFolderId(null);
      setCurrentPath([]);
    }
    navigate(path);
  };

  useEffect(() => {
    if (location.pathname === Paths.DOCUMENT_MANAGEMENT) {
      navigate(Paths.DOCUMENT_ALL_FILES, { replace: true });
    }
  }, [location.pathname, navigate]);

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
    if (selectedFile) {
      const file = files.find((f) => f.id === selectedFile);
      if (file) {
        if (file.type === 'folder') {
          dispatch(actions.deleteFolder(file.id));
        } else {
          dispatch(actions.deleteFile(file.id));
        }
      }
      setSelectedFile(null);
    }
  };

  const handlePreview = () => {
    const file = files.find((f) => f.id === selectedFile);
    if (file && file.type === 'file' && file.mimeType && file.mimeType.startsWith('image/')) {
      setPreviewFile(file);
    }
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const handleNavigatePreview = (file) => {
    setPreviewFile(file);
  };

  const handleShare = (file) => {
    if (previewFile) {
      setPreviewFile(null);
    }

    const targetFile = file || previewFile || files.find((f) => f.id === selectedFile);

    if (targetFile) {
      setFileToShare(targetFile);
      setShareModalOpen(true);
    }
  };

  const handleDownload = async () => {
    if (previewFile) {
      try {
        const response = await fetch(`/api/files/${previewFile.id}/download`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Download failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = previewFile.name || `file-${previewFile.id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download error:', error);
      }
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedFile) {
      const file = files.find((f) => f.id === selectedFile);
      if (file && file.type === 'file') {
        try {
          const response = await fetch(`/api/files/${file.id}/download`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Download failed');
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = file.name || `file-${file.id}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Download error:', error);
        }
      }
    }
  };

  const handleContextMenuPreview = (file) => {
    if (file && file.type === 'file' && file.mimeType && file.mimeType.startsWith('image/')) {
      setPreviewFile(file);
    }
  };

  const handleContextMenuShare = (file) => {
    if (file) {
      setFileToShare(file);
      setShareModalOpen(true);
    }
  };

  const handleContextMenuDownload = async (file) => {
    if (file && file.type === 'file') {
      try {
        const response = await fetch(`/api/files/${file.id}/download`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Download failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name || `file-${file.id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download error:', error);
      }
    }
  };

  const handleContextMenuDelete = (file) => {
    if (file) {
      if (file.type === 'folder') {
        dispatch(actions.deleteFolder(file.id));
      } else {
        dispatch(actions.deleteFile(file.id));
      }
      if (selectedFile === file.id) {
        setSelectedFile(null);
      }
    }
  };

  const handleCreateFolder = (folderName) => {
    if (selectedWorkspace) {
      const localId = createLocalId();
      dispatch(
        actions.createFolder({
          id: localId,
          name: folderName,
          spaceId: selectedWorkspace,
          parentFolderId: currentFolderId,
        }),
      );
    }
  };

  const handleFileUpload = (e) => {
    const { files: uploadedFiles } = e.target;
    if (uploadedFiles.length > 0 && selectedWorkspace) {
      const localId = createLocalId();
      const formData = new FormData();
      Array.from(uploadedFiles).forEach((file) => {
        formData.append('files', file);
      });

      dispatch(
        actions.uploadFile({
          id: localId,
          name: 'Uploading...',
          spaceId: selectedWorkspace,
          folderId: currentFolderId,
          formData,
        }),
      );
    }
  };

  const handleExternalFileDrop = (droppedFiles) => {
    if (droppedFiles.length > 0 && selectedWorkspace) {
      const localId = createLocalId();
      const formData = new FormData();
      Array.from(droppedFiles).forEach((file) => {
        formData.append('files', file);
      });

      dispatch(
        actions.uploadFile({
          id: localId,
          name: 'Uploading...',
          spaceId: selectedWorkspace,
          folderId: currentFolderId,
          formData,
        }),
      );
    }
  };

  const handleCreateWorkspace = (workspaceName) => {
    const localId = createLocalId();
    pendingWorkspaceRef.current = localId;
    dispatch(
      actions.createSpace({
        id: localId,
        name: workspaceName,
      }),
    );
  };

  const handleRenameWorkspace = (workspaceId, newName) => {
    if (workspaceId) {
      dispatch(
        actions.updateSpace(workspaceId, {
          name: newName,
        }),
      );
    }
  };

  const handleDeleteWorkspace = (workspaceValue) => {
    dispatch(actions.deleteSpace(workspaceValue));
    setShowWorkspacePopup(false);
  };

  const handleDragStart = (e, file) => {
    setDraggedFile(file);
  };

  const handleDragEnd = () => {
    setDraggedFile(null);
    setDropTarget(null);
  };

  const handleDragOver = (e, folder) => {
    e.preventDefault();
    if (draggedFile && folder.type === 'folder' && draggedFile.id !== folder.id) {
      // Prevent dropping a folder into itself
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
    if (draggedFile && folder.type === 'folder' && draggedFile.id !== folder.id) {
      if (draggedFile.type === 'file') {
        dispatch(
          actions.updateFile(draggedFile.id, {
            folderId: folder.id,
          }),
        );
      } else if (draggedFile.type === 'folder') {
        dispatch(
          actions.updateFolder(draggedFile.id, {
            parentFolderId: folder.id,
          }),
        );
      }
    }
    setDraggedFile(null);
    setDropTarget(null);
  };

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

  const openWorkspaceRenameModal = (workspace) => {
    setModalConfig({
      type: 'workspace-rename',
      title: 'Rename workspace',
      label: 'Workspace name',
      defaultValue: workspace.text,
      submitLabel: 'Rename',
      onSubmit: (newName) => handleRenameWorkspace(workspace.value, newName),
    });
  };

  const openWorkspaceDeleteModal = (workspace) => {
    setDeleteConfirmWorkspace(workspace);
  };

  const currentFiles = getFilteredFiles();
  const sectionTitle = getSectionTitle();

  return (
    <div className={styles.wrapper}>
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
        onFileUpload={handleFileUpload}
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
          openWorkspaceRenameModal(workspace);
          setShowWorkspacePopup(false);
        }}
        onDeleteWorkspace={(e, workspace) => {
          e.stopPropagation();
          openWorkspaceDeleteModal(workspace);
          setShowWorkspacePopup(false);
        }}
        onCreateWorkspace={() => {
          openWorkspaceCreateModal();
          setShowWorkspacePopup(false);
        }}
      />

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

      <div className={styles.mainContent}>
        <TopBar
          sectionTitle={sectionTitle}
          currentPath={currentPath}
          view={view}
          onBreadcrumbClick={handleBreadcrumbClick}
          onFolderCreate={openFolderModal}
          onFileUpload={handleFileUpload}
          onViewChange={setView}
        />

        <SortBar
          sortBy={sortBy}
          selectedFile={selectedFile}
          selectedFileData={files.find((f) => f.id === selectedFile)}
          onSortChange={setSortBy}
          onPreview={handlePreview}
          onShare={handleShare}
          onDelete={handleDeleteSelected}
          onDownload={handleDownloadSelected}
        />

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
            onExternalDrop={handleExternalFileDrop}
            onPreview={handleContextMenuPreview}
            onShare={handleContextMenuShare}
            onDownload={handleContextMenuDownload}
            onDelete={handleContextMenuDelete}
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
            onExternalDrop={handleExternalFileDrop}
            onPreview={handleContextMenuPreview}
            onShare={handleContextMenuShare}
            onDownload={handleContextMenuDownload}
            onDelete={handleContextMenuDelete}
          />
        )}
      </div>

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          files={files}
          onClose={handleClosePreview}
          onShare={() => handleShare(previewFile)}
          onDownload={handleDownload}
          onNavigate={handleNavigatePreview}
        />
      )}

      {shareModalOpen && fileToShare && (
        <ShareModal
          file={fileToShare}
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setFileToShare(null);
          }}
          onCreateShareLink={async (linkData) => {
            try {
              const result = await api.createShareLink(linkData, {
                Authorization: `Bearer ${accessToken}`,
              });

              dispatch(
                actions.createShareLink.success({
                  resourceType: 'file',
                  resourceId: fileToShare.id,
                  ...result,
                }),
              );

              return result;
            } catch (error) {
              dispatch(actions.createShareLink.failure(error));
              throw error;
            }
          }}
        />
      )}

      <Confirm
        open={!!deleteConfirmWorkspace}
        header="Delete workspace"
        content={`Are you sure you want to delete "${deleteConfirmWorkspace?.text}"? This action cannot be undone.`}
        confirmButton="Delete"
        cancelButton="Cancel"
        onConfirm={() => {
          if (deleteConfirmWorkspace) {
            handleDeleteWorkspace(deleteConfirmWorkspace.value);
            setDeleteConfirmWorkspace(null);
          }
        }}
        onCancel={() => setDeleteConfirmWorkspace(null)}
      />
    </div>
  );
});

export default DocumentManagement;
