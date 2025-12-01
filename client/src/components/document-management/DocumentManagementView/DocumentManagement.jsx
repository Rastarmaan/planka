/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Confirm, Button, Icon } from 'semantic-ui-react';

import actions from '../../../actions';
import api from '../../../api';
import permissionsApi from '../../../api/permissions';
import selectors, {
  makeSelectSpaces,
  makeSelectFoldersBySpaceId,
  makeSelectFilesBySpaceId,
} from '../../../selectors';
import { createLocalId } from '../../../utils/local-id';
import { UserRoles } from '../../../constants/Enums';
import Paths from '../../../constants/Paths';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';
import SortBar from '../TopBar/SortBar';
import FileGrid from '../FileViews/FileGrid';
import FileList from '../FileViews/FileList';
import FilePreviewModal from '../FilePreviewModal/FilePreviewModal';
import ShareModal from '../ShareModal/ShareModal';
import InputModal from '../InputModal/InputModal';
import ActivityLogView from '../ActivityLogView/ActivityLogView';
import styles from './DocumentManagement.module.scss';

const DocumentManagement = React.memo(() => {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const workspacePopupRef = useRef(null);
  const pendingWorkspaceRef = useRef(null);

  const selectSpaces = useMemo(makeSelectSpaces, []);
  const spaces = useSelector(selectSpaces);
  const accessToken = useSelector(selectors.selectAccessToken);
  const currentUser = useSelector(selectors.selectCurrentUser);

  const isAdmin = currentUser && currentUser.role === UserRoles.ADMIN;

  const [userPermissions, setUserPermissions] = useState([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [hasDocumentAccess, setHasDocumentAccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchUserPermissions = async () => {
      if (isAdmin) {
        setPermissionsLoading(false);
        setHasDocumentAccess(true);
        return;
      }

      try {
        const res = await permissionsApi.getMyPermissions({
          Authorization: `Bearer ${accessToken}`,
        });

        if (!mounted) return;

        const items = (res && res.items) || [];
        setUserPermissions(items);
        setHasDocumentAccess(items.length > 0);
      } catch {
        if (mounted) {
          setUserPermissions([]);
          setHasDocumentAccess(false);
        }
      } finally {
        if (mounted) {
          setPermissionsLoading(false);
        }
      }
    };

    if (currentUser) {
      fetchUserPermissions();
    }

    return () => {
      mounted = false;
    };
  }, [currentUser, isAdmin, accessToken]);

  useEffect(() => {
    if (!permissionsLoading && currentUser && !isAdmin && !hasDocumentAccess) {
      navigate(Paths.ROOT);
    }
  }, [currentUser, isAdmin, hasDocumentAccess, permissionsLoading, navigate]);

  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('modified');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [resourceToShare, setResourceToShare] = useState(null);
  const [resourceTypeToShare, setResourceTypeToShare] = useState('file');
  const [modalConfig, setModalConfig] = useState(null);
  const [showWorkspacePopup, setShowWorkspacePopup] = useState(false);
  const [deleteConfirmWorkspace, setDeleteConfirmWorkspace] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
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
    const allFiles = [
      ...folders.map((f) => ({ ...f, type: 'folder', icon: 'folder', formattedSize: '-' })),
      ...filesList.map((f) => ({
        ...f,
        type: 'file',
        icon: getFileIcon(f.name),
        formattedSize: formatFileSize(f.size),
      })),
    ];

    return allFiles;
  }, [folders, filesList, getFileIcon, formatFileSize]);

  useEffect(() => {
    dispatch(actions.fetchSpaces());
  }, [dispatch]);

  const prevSpaceIdsRef = useRef([]);

  const currentSection = location.pathname.split('/').pop() || 'all-files';

  const filteredSpaces = useMemo(() => {
    if (isAdmin) {
      return spaces;
    }

    if (userPermissions.length === 0) {
      return [];
    }

    const allowedSpaceIds = new Set();
    userPermissions.forEach((perm) => {
      if (perm.space && perm.space.id) {
        allowedSpaceIds.add(String(perm.space.id));
      }
    });

    return spaces.filter((space) => allowedSpaceIds.has(String(space.id)));
  }, [spaces, isAdmin, userPermissions]);

  const workspaces = useMemo(
    () =>
      filteredSpaces.map((space) => ({
        key: space.id,
        text: space.name,
        value: space.id,
        description: space.description,
        selected: space.id === selectedWorkspace,
      })),
    [filteredSpaces, selectedWorkspace],
  );

  useEffect(() => {
    if (filteredSpaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(filteredSpaces[0].id);
    }
  }, [filteredSpaces, selectedWorkspace]);

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
    if (filteredSpaces.length > 0) {
      if (selectedWorkspace && !filteredSpaces.find((s) => s.id === selectedWorkspace)) {
        setSelectedWorkspace(filteredSpaces[0].id);
        setCurrentFolderId(null);
        setCurrentPath([]);
      }
    }
  }, [filteredSpaces, selectedWorkspace]);

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'all-files':
        return t('documentManagement.allFiles');
      case 'shared':
        return t('documentManagement.shared');
      case 'recent':
        return t('documentManagement.recent');
      case 'starred':
        return t('documentManagement.starred');
      case 'trash':
        return t('documentManagement.trash');
      case 'activity':
        return t('documentManagement.activityLog', 'Activity Log');
      default:
        return t('documentManagement.allFiles');
    }
  };

  const getFilteredFiles = () => {
    if (currentSection === 'activity') {
      return [];
    }
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
        setDeleteConfirmItem(file);
      }
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmItem) {
      if (deleteConfirmItem.type === 'folder') {
        dispatch(actions.deleteFolder(deleteConfirmItem.id));
      } else {
        dispatch(actions.deleteFile(deleteConfirmItem.id));
      }
      if (selectedFile === deleteConfirmItem.id) {
        setSelectedFile(null);
      }
      setDeleteConfirmItem(null);
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

  const handleShare = (file, resourceType = 'file') => {
    if (previewFile) {
      setPreviewFile(null);
    }

    const targetFile = file || previewFile || files.find((f) => f.id === selectedFile);

    if (targetFile) {
      setResourceToShare(targetFile);
      setResourceTypeToShare(resourceType);
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
          // eslint-disable-next-line no-console
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
      setResourceToShare(file);
      const resourceType = file.type === 'folder' ? 'folder' : 'file';
      setResourceTypeToShare(resourceType);
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
      setDeleteConfirmItem(file);
    }
  };

  const handleRenameFolder = (folderId, newName) => {
    if (folderId && newName) {
      dispatch(actions.updateFolder(folderId, { name: newName }));
    }
  };

  const openFolderRenameModal = (folder) => {
    setModalConfig({
      type: 'folder-rename',
      title: t('action.rename', 'Rename'),
      label: t('common.name', 'Name'),
      defaultValue: folder.name,
      submitLabel: t('action.rename', 'Rename'),
      onSubmit: (newName) => handleRenameFolder(folder.id, newName),
    });
  };

  const handleContextMenuRename = (file) => {
    if (file && file.type === 'folder') {
      openFolderRenameModal(file);
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

  const handleCreateWorkspace = (workspaceName, workspaceDescription = '') => {
    const localId = createLocalId();
    pendingWorkspaceRef.current = localId;
    dispatch(
      actions.createSpace({
        id: localId,
        name: workspaceName,
        description: workspaceDescription,
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
      setDropTarget(folder.id === 'root' ? 'root' : folder.id);
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
            folderId: folder.id === 'root' ? null : folder.id,
          }),
        );
      } else if (draggedFile.type === 'folder') {
        dispatch(
          actions.updateFolder(draggedFile.id, {
            parentFolderId: folder.id === 'root' ? null : folder.id,
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
      hasDescription: true,
      descriptionLabel: 'Description (optional)',
      descriptionDefaultValue: '',
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

  const handleBackToProjects = () => {
    navigate(Paths.ROOT);
  };

  const currentFiles = getFilteredFiles();
  const sectionTitle = getSectionTitle();

  if (permissionsLoading) {
    return null;
  }

  if (!isAdmin && !hasDocumentAccess) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.documentHeader}>
        <Button
          basic
          size="small"
          className={styles.backToProjectsButton}
          onClick={handleBackToProjects}
        >
          <Icon name="arrow left" />
          {/* {t('action.backToProjects', 'Back to Projects')} */}
        </Button>
        <h2 className={styles.documentTitle}>Document Management</h2>
      </div>

      <div className={styles.contentWrapper}>
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
          draggedFile={draggedFile}
          dropTarget={dropTarget}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          canUpload={isAdmin}
          canManageWorkspaces={isAdmin}
          isAdmin={isAdmin}
        />

        {modalConfig && (
          <InputModal
            title={modalConfig.title}
            label={modalConfig.label}
            defaultValue={modalConfig.defaultValue}
            submitLabel={modalConfig.submitLabel}
            hasDescription={modalConfig.hasDescription}
            descriptionLabel={modalConfig.descriptionLabel}
            descriptionDefaultValue={modalConfig.descriptionDefaultValue}
            onSubmit={modalConfig.onSubmit}
            onClose={() => setModalConfig(null)}
          />
        )}

        <div className={styles.mainContent}>
          {currentSection === 'activity' ? (
            <ActivityLogView spaceId={selectedWorkspace} />
          ) : (
            <>
              <TopBar
                sectionTitle={sectionTitle}
                currentPath={currentPath}
                view={view}
                onBreadcrumbClick={handleBreadcrumbClick}
                onFolderCreate={openFolderModal}
                onFileUpload={handleFileUpload}
                onViewChange={setView}
                canUpload={isAdmin}
              />

              <SortBar
                sortBy={sortBy}
                selectedFile={selectedFile}
                selectedFileData={files.find((f) => f.id === selectedFile)}
                currentPath={currentPath}
                onSortChange={setSortBy}
                onPreview={handlePreview}
                onShare={() => {
                  const selectedFileData = files.find((f) => f.id === selectedFile);
                  if (selectedFileData) {
                    handleShare(selectedFileData);
                  }
                }}
                onRename={() => {
                  const selectedFileData = files.find((f) => f.id === selectedFile);
                  if (selectedFileData) {
                    handleContextMenuRename(selectedFileData);
                  }
                }}
                onDelete={handleDeleteSelected}
                onDownload={handleDownloadSelected}
                onGoBack={() => handleBreadcrumbClick(currentPath.length - 2)}
                canShare={isAdmin}
                canDelete={isAdmin}
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
                  onRename={handleContextMenuRename}
                  canShare={isAdmin}
                  canDelete={isAdmin}
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
                  onRename={handleContextMenuRename}
                  canShare={isAdmin}
                  canDelete={isAdmin}
                />
              )}
            </>
          )}
        </div>
      </div>

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          files={files}
          onClose={handleClosePreview}
          onShare={() => handleShare(previewFile)}
          onDownload={handleDownload}
          onNavigate={handleNavigatePreview}
          canShare={isAdmin}
        />
      )}

      {shareModalOpen && resourceToShare && (
        <ShareModal
          resource={resourceToShare}
          resourceType={resourceTypeToShare}
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setResourceToShare(null);
          }}
          onCreateShareLink={async (linkData) => {
            try {
              const result = await api.createShareLink(linkData, {
                Authorization: `Bearer ${accessToken}`,
              });

              dispatch(actions.createShareLink.success(result.item));

              return result.item;
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
        cancelButton={t('action.cancel')}
        onConfirm={() => {
          if (deleteConfirmWorkspace) {
            handleDeleteWorkspace(deleteConfirmWorkspace.value);
            setDeleteConfirmWorkspace(null);
          }
        }}
        onCancel={() => setDeleteConfirmWorkspace(null)}
      />

      <Confirm
        open={!!deleteConfirmItem}
        header={`Delete ${deleteConfirmItem?.type}`}
        content={`Are you sure you want to delete "${deleteConfirmItem?.name}"? This action cannot be undone.`}
        confirmButton="Delete"
        cancelButton={t('action.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmItem(null)}
      />
    </div>
  );
});

export default DocumentManagement;
