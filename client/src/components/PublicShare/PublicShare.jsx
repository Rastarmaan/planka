/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, Form, Icon, Input, Message, Segment, Table } from 'semantic-ui-react';
import { toast } from 'react-hot-toast';
import hljs from 'highlight.js';
import publicApi from '../../api/public';
import { formatBytes, formatDate } from '../../utils/helpers';

import 'highlight.js/styles/vs2015.css';
import styles from './PublicShare.module.scss';

function PublicShare() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [shareData, setShareData] = useState(null);
  const [error, setError] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [textContent, setTextContent] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const [folderDownloadLoading, setFolderDownloadLoading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewFileLoading, setPreviewFileLoading] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState(null);
  const [previewTextContent, setPreviewTextContent] = useState(null);
  const [previewFileDownloadLoading, setPreviewFileDownloadLoading] = useState(false);
  const initialLoadRef = useRef(false);
  const passwordRef = useRef('');
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const isImage = useCallback((file) => {
    if (file.mimeType && file.mimeType.startsWith('image/')) {
      return true;
    }
    if (file.name) {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp'].includes(ext);
    }
    return false;
  }, []);

  const isVideo = useCallback((file) => {
    if (file.mimeType && file.mimeType.startsWith('video/')) {
      return true;
    }
    if (file.name) {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm4v'].includes(ext);
    }
    return false;
  }, []);

  const isAudio = useCallback((file) => {
    if (file.mimeType && file.mimeType.startsWith('audio/')) {
      return true;
    }
    if (file.name) {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma'].includes(ext);
    }
    return false;
  }, []);

  const isPdf = useCallback((file) => {
    if (file.mimeType === 'application/pdf') {
      return true;
    }
    if (file.name) {
      const ext = file.name.split('.').pop().toLowerCase();
      return ext === 'pdf';
    }
    return false;
  }, []);

  const isOfficeDocument = useCallback((file) => {
    const officeMimeTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    if (file.mimeType && officeMimeTypes.includes(file.mimeType)) {
      return true;
    }
    if (file.name) {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);
    }
    return false;
  }, []);

  const isArchive = useCallback((file) => {
    const archiveMimeTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/vnd.rar',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-gzip',
      'application/x-bzip2',
    ];
    if (file.mimeType && archiveMimeTypes.includes(file.mimeType)) {
      return true;
    }
    if (file.name) {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'tar.gz', 'tgz'].includes(ext);
    }
    return false;
  }, []);

  const isTextFile = useCallback((file) => {
    const textMimeTypes = [
      'text/plain',
      'text/markdown',
      'text/csv',
      'text/html',
      'text/css',
      'text/javascript',
      'text/xml',
      'application/json',
      'application/javascript',
      'application/xml',
    ];
    if (
      file.mimeType &&
      (textMimeTypes.includes(file.mimeType) || file.mimeType.startsWith('text/'))
    ) {
      return true;
    }
    if (file.name) {
      const ext = file.name.split('.').pop().toLowerCase();
      return [
        // Text files
        'txt',
        'md',
        'markdown',
        'csv',
        'tsv',
        'log',
        // Web
        'html',
        'htm',
        'css',
        'scss',
        'sass',
        'less',
        // JavaScript/TypeScript
        'js',
        'jsx',
        'ts',
        'tsx',
        'mjs',
        'cjs',
        // Python
        'py',
        'pyw',
        'pyx',
        // Java/Kotlin
        'java',
        'kt',
        'kts',
        // C/C++
        'c',
        'cpp',
        'cc',
        'cxx',
        'h',
        'hpp',
        'hxx',
        // C#
        'cs',
        // Go
        'go',
        // Rust
        'rs',
        // Ruby
        'rb',
        // PHP
        'php',
        // Swift
        'swift',
        // Scala
        'scala',
        // Shell
        'sh',
        'bash',
        'zsh',
        'fish',
        'ps1',
        'bat',
        'cmd',
        // Config
        'json',
        'xml',
        'yaml',
        'yml',
        'toml',
        'ini',
        'cfg',
        'conf',
        'env',
        // SQL
        'sql',
        // Vue/Svelte
        'vue',
        'svelte',
      ].includes(ext);
    }
    return false;
  }, []);

  const getLanguageFromFile = useCallback((file) => {
    if (!file.name) return 'text';
    const ext = file.name.split('.').pop().toLowerCase();
    const langMap = {
      js: 'javascript',
      jsx: 'javascript',
      mjs: 'javascript',
      cjs: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      pyw: 'python',
      pyx: 'python',
      java: 'java',
      kt: 'kotlin',
      kts: 'kotlin',
      c: 'c',
      cpp: 'cpp',
      cc: 'cpp',
      cxx: 'cpp',
      h: 'c',
      hpp: 'cpp',
      hxx: 'cpp',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      rb: 'ruby',
      php: 'php',
      swift: 'swift',
      scala: 'scala',
      sh: 'bash',
      bash: 'bash',
      zsh: 'bash',
      fish: 'bash',
      ps1: 'powershell',
      bat: 'batch',
      cmd: 'batch',
      json: 'json',
      xml: 'xml',
      html: 'html',
      htm: 'html',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      less: 'less',
      yaml: 'yaml',
      yml: 'yaml',
      toml: 'toml',
      ini: 'ini',
      cfg: 'ini',
      conf: 'ini',
      sql: 'sql',
      md: 'markdown',
      markdown: 'markdown',
      vue: 'vue',
      svelte: 'svelte',
      txt: 'text',
      log: 'text',
      csv: 'csv',
      tsv: 'csv',
      env: 'bash',
    };
    return langMap[ext] || 'text';
  }, []);

  // eslint-disable-next-line no-unused-vars
  const hasPreview = useCallback(
    (file) => {
      return isImage(file) || isVideo(file) || isAudio(file) || isPdf(file) || isTextFile(file);
    },
    [isImage, isVideo, isAudio, isPdf, isTextFile],
  );

  const getFileIcon = useCallback((file) => {
    if (!file.name) return 'file outline';
    const ext = file.name.split('.').pop().toLowerCase();
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
        return 'file archive';
      case 'txt':
      case 'md':
        return 'file text';
      case 'mp4':
      case 'webm':
      case 'mov':
      case 'avi':
        return 'video';
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'm4a':
        return 'music';
      default:
        return 'file outline';
    }
  }, []);

  const getOfficeType = useCallback((file) => {
    if (!file.name) return null;
    const ext = file.name.split('.').pop().toLowerCase();
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
    return null;
  }, []);

  const getTimeRemaining = useCallback((expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return { expired: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return { text: `${days} day${days > 1 ? 's' : ''} remaining` };
    if (hours > 0) return { text: `${hours} hour${hours > 1 ? 's' : ''} remaining` };
    if (minutes > 0) return { text: `${minutes} minute${minutes > 1 ? 's' : ''} remaining` };
    return { text: 'Less than a minute remaining', urgent: true };
  }, []);

  const getExpirationDetails = useCallback(
    (expiresAt) => {
      if (!expiresAt) return null;
      const now = new Date();
      const expiry = new Date(expiresAt);

      if (expiry <= now) {
        return { expired: true, message: 'This link has expired' };
      }

      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const date = expiry.getDate();
      const month = monthNames[expiry.getMonth()];
      const year = expiry.getFullYear();
      const hours = String(expiry.getHours()).padStart(2, '0');
      const minutes = String(expiry.getMinutes()).padStart(2, '0');

      const timeRemaining = getTimeRemaining(expiresAt);
      return {
        expired: false,
        dateString: `${month} ${date}, ${year}`,
        timeString: `${hours}:${minutes}`,
        remaining: timeRemaining?.text || '',
      };
    },
    [getTimeRemaining],
  );

  const loadImagePreview = useCallback(
    async (file) => {
      if (!isImage(file)) return;

      try {
        setImageLoading(true);
        const blob = await publicApi.previewPublicFile(token, password || null);
        const url = window.URL.createObjectURL(blob);
        setImagePreview(url);
      } catch (err) {
        // ignore preview errors
      } finally {
        setImageLoading(false);
      }
    },
    [token, password, isImage],
  );

  const loadMediaPreview = useCallback(
    async (file) => {
      if (!isVideo(file) && !isAudio(file) && !isPdf(file)) return;

      try {
        setMediaLoading(true);
        const blob = await publicApi.previewPublicFile(token, password || null);
        const url = window.URL.createObjectURL(blob);
        setMediaPreviewUrl(url);
      } catch (err) {
        // ignore preview errors
      } finally {
        setMediaLoading(false);
      }
    },
    [token, password, isVideo, isAudio, isPdf],
  );

  const loadTextPreview = useCallback(
    async (file) => {
      if (!isTextFile(file)) return;

      try {
        setTextLoading(true);
        const blob = await publicApi.previewPublicFile(token, password || null);
        const text = await blob.text();
        const truncatedText =
          text.length > 50000 ? `${text.substring(0, 50000)}\n\n... (truncated)` : text;
        setTextContent(truncatedText);
      } catch (err) {
        // ignore preview errors
      } finally {
        setTextLoading(false);
      }
    },
    [token, password, isTextFile],
  );

  const highlightedCode = useMemo(() => {
    if (!textContent || !shareData?.item) return null;

    const language = getLanguageFromFile(shareData.item);

    if (language === 'text' || language === 'csv') {
      return { __html: textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;') };
    }

    try {
      if (hljs.getLanguage(language)) {
        const result = hljs.highlight(textContent, { language });
        return { __html: result.value };
      }
      const result = hljs.highlightAuto(textContent);
      return { __html: result.value };
    } catch (err) {
      return { __html: textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;') };
    }
  }, [textContent, shareData, getLanguageFromFile]);

  const accessShare = useCallback(
    async (passwordInput = null) => {
      try {
        setLoading(true);
        setPasswordError('');
        setError('');

        const response = await publicApi.accessPublicLink(token, passwordInput);
        setShareData(response);
        setShowPasswordForm(false);
      } catch (err) {
        let errorCode = null;
        let errorMessage = 'Failed to access shared resource';

        if (err?.response) {
          const { status, data } = err.response;

          if (typeof data === 'object' && data !== null) {
            errorCode = data.code;
            errorMessage = data.message || data.error;
          } else if (typeof data === 'string') {
            if (data.includes('Implementation')) {
              errorMessage =
                'Share link feature is not available. Server may not be configured properly.';
            } else {
              errorMessage = data;
            }
          }

          if (status === 404) {
            errorMessage = errorMessage || 'Share link not found or expired';
          } else if (status === 500) {
            errorMessage = errorMessage || 'Server error - please try again later';
          } else if (status >= 400) {
            errorMessage = errorMessage || `HTTP ${status} error`;
          }
        } else if (err?.code) {
          errorCode = err.code;
          errorMessage = err.message;
        } else if (err?.message) {
          errorMessage = err.message;
        }

        if (errorCode === 'E_PASSWORD_REQUIRED') {
          setShowPasswordForm(true);
        } else if (errorCode === 'E_INVALID_PASSWORD') {
          setPasswordError('Invalid password');
        } else if (errorCode === 'E_EXPIRED') {
          setError('This share link has expired');
        } else if (errorCode === 'E_ACCESS_LIMIT') {
          setError('This share link has reached its access limit');
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  const handlePasswordSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (password.trim()) {
        accessShare(password);
      }
    },
    [password, accessShare],
  );

  const handleDownload = useCallback(async () => {
    try {
      setDownloadLoading(true);
      const blob = await publicApi.downloadPublicFile(token, passwordRef.current || null);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = shareData.item.name || 'download';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Download started');
    } catch (err) {
      toast.error('Failed to download file');
    } finally {
      setDownloadLoading(false);
    }
  }, [token, shareData]);

  const handleFolderDownload = useCallback(async () => {
    try {
      setFolderDownloadLoading(true);
      const blob = await publicApi.downloadPublicFolder(token, passwordRef.current || null);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${shareData.item.name || 'folder'}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Download started');
    } catch (err) {
      if (err?.code === 'E_EMPTY_FOLDER') {
        toast.error('No files to download');
      } else {
        toast.error('Failed to download folder');
      }
    } finally {
      setFolderDownloadLoading(false);
    }
  }, [token, shareData]);

  const handleFileClick = useCallback(
    async (file) => {
      setPreviewFile(file);
      setPreviewModalOpen(true);
      setPreviewFileLoading(true);
      setPreviewFileUrl(null);
      setPreviewTextContent(null);

      try {
        const blob = await publicApi.previewFolderFile(token, file.id, passwordRef.current || null);

        if (isTextFile(file)) {
          const text = await blob.text();
          const truncatedText =
            text.length > 50000 ? `${text.substring(0, 50000)}\n\n... (truncated)` : text;
          setPreviewTextContent(truncatedText);
        } else {
          const url = window.URL.createObjectURL(blob);
          setPreviewFileUrl(url);
        }
      } catch (err) {
        // Preview not available
      } finally {
        setPreviewFileLoading(false);
      }
    },
    [token, isTextFile],
  );

  const handleClosePreviewModal = useCallback(() => {
    setPreviewModalOpen(false);
    setPreviewFile(null);
    if (previewFileUrl) {
      window.URL.revokeObjectURL(previewFileUrl);
    }
    setPreviewFileUrl(null);
    setPreviewTextContent(null);
  }, [previewFileUrl]);

  const handleDownloadPreviewFile = useCallback(async () => {
    if (!previewFile) return;

    try {
      setPreviewFileDownloadLoading(true);
      const blob = await publicApi.downloadFolderFile(
        token,
        previewFile.id,
        passwordRef.current || null,
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = previewFile.name || 'download';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Download started');
    } catch (err) {
      if (err?.code === 'E_DOWNLOAD_DISABLED') {
        toast.error('Download not allowed');
      } else {
        toast.error('Failed to download file');
      }
    } finally {
      setPreviewFileDownloadLoading(false);
    }
  }, [token, previewFile]);

  const getHljsLanguageForFile = useCallback(
    (file) => {
      if (!file) return 'text';
      return getLanguageFromFile(file);
    },
    [getLanguageFromFile],
  );

  const highlightedPreviewCode = useMemo(() => {
    if (!previewTextContent || !previewFile) return null;

    const language = getHljsLanguageForFile(previewFile);

    if (language === 'text' || language === 'csv') {
      return { __html: previewTextContent.replace(/</g, '&lt;').replace(/>/g, '&gt;') };
    }

    try {
      if (hljs.getLanguage(language)) {
        const result = hljs.highlight(previewTextContent, { language });
        return { __html: result.value };
      }
      const result = hljs.highlightAuto(previewTextContent);
      return { __html: result.value };
    } catch (err) {
      return { __html: previewTextContent.replace(/</g, '&lt;').replace(/>/g, '&gt;') };
    }
  }, [previewTextContent, previewFile, getHljsLanguageForFile]);

  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      accessShare();
    }
  }, [accessShare]);

  useEffect(() => {
    passwordRef.current = password;
  }, [password]);

  useEffect(() => {
    if (shareData?.item && isImage(shareData.item)) {
      loadImagePreview(shareData.item);
    }
  }, [shareData, isImage, loadImagePreview]);

  useEffect(() => {
    if (
      shareData?.item &&
      (isVideo(shareData.item) || isAudio(shareData.item) || isPdf(shareData.item))
    ) {
      loadMediaPreview(shareData.item);
    }
  }, [shareData, isVideo, isAudio, isPdf, loadMediaPreview]);

  useEffect(() => {
    if (shareData?.item && isTextFile(shareData.item)) {
      loadTextPreview(shareData.item);
    }
  }, [shareData, isTextFile, loadTextPreview]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        window.URL.revokeObjectURL(imagePreview);
      }
      if (mediaPreviewUrl) {
        window.URL.revokeObjectURL(mediaPreviewUrl);
      }
    };
  }, [imagePreview, mediaPreviewUrl]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.minimalHeader}>
          <div className={styles.headerContent}>
            <span className={styles.loadingText}>Loading...</span>
          </div>
        </div>
        <div className={styles.content}>
          <Segment loading style={{ height: '200px', background: 'transparent' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.minimalHeader}>
          <div className={styles.headerContent}>
            <Icon name="warning circle" color="red" className={styles.headerIcon} />
            <span>Access Denied</span>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.errorBox}>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (showPasswordForm) {
    const timeRemaining = shareData?.shareLink?.expiresAt
      ? getTimeRemaining(shareData.shareLink.expiresAt)
      : null;

    return (
      <div className={styles.container}>
        <div className={styles.minimalHeader}>
          <div className={styles.headerContent}>
            <Icon name="lock" className={styles.headerIcon} />
            <span>Protected Content</span>
          </div>
        </div>
        <div className={styles.content}>
          {timeRemaining && (
            <Message
              warning={timeRemaining.urgent}
              info={!timeRemaining.urgent}
              className={styles.expirationWarning}
            >
              <Icon name="clock" />
              {timeRemaining.expired ? 'This link has expired' : timeRemaining.text}
            </Message>
          )}
          <Card fluid className={styles.passwordCard}>
            <Card.Content>
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Field>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!passwordError}
                    icon="lock"
                    iconPosition="left"
                    size="large"
                    fluid
                  />
                  {passwordError && (
                    <Message error size="small">
                      <Icon name="exclamation triangle" />
                      {passwordError}
                    </Message>
                  )}
                </Form.Field>
                <Button type="submit" primary size="large" loading={loading} fluid>
                  <Icon name="unlock" />
                  Access
                </Button>
              </Form>
            </Card.Content>
          </Card>
        </div>
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className={styles.container}>
        <div className={styles.minimalHeader}>
          <div className={styles.headerContent}>
            <Icon name="question circle" color="grey" className={styles.headerIcon} />
            <span>Not Found</span>
          </div>
        </div>
      </div>
    );
  }

  const { item, shareLink, included } = shareData;
  const { resourceType } = shareLink;
  const timeRemaining = shareLink.expiresAt ? getTimeRemaining(shareLink.expiresAt) : null;

  const getResourceIcon = () => {
    if (resourceType === 'file') return getFileIcon(item);
    if (resourceType === 'folder') return 'folder';
    return 'database';
  };

  return (
    <div className={styles.container}>
      <div className={styles.minimalHeader}>
        <div className={styles.headerContent}>
          <Icon name={getResourceIcon()} className={styles.headerIcon} />
          <span className={styles.headerTitle}>{item.name}</span>
          {shareLink.isDownloadable && resourceType === 'file' && (
            <Button
              className={styles.headerDownloadButton}
              icon
              labelPosition="left"
              onClick={handleDownload}
              loading={downloadLoading}
              size="small"
            >
              <Icon name="download" />
              Download
            </Button>
          )}
          {shareLink.isDownloadable && (resourceType === 'folder' || resourceType === 'space') && (
            <Button
              className={styles.headerDownloadButton}
              icon
              labelPosition="left"
              onClick={handleFolderDownload}
              loading={folderDownloadLoading}
              size="small"
            >
              <Icon name="download" />
              Download
            </Button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {timeRemaining && (
          <Message className={styles.expirationWarning}>
            <Icon name="hourglass end" className={styles.infoIconExpiration} />
            Expires: {getExpirationDetails(shareLink.expiresAt)?.dateString}{' '}
            <span className={styles.expirationTimeSmall}>
              {getExpirationDetails(shareLink.expiresAt)?.timeString}
            </span>
          </Message>
        )}

        {resourceType === 'file' && (
          <div className={styles.modernContainer}>
            {/* Image Preview */}
            {isImage(item) && (
              <div className={styles.previewSection}>
                <div className={styles.previewContainer}>
                  {imageLoading && (
                    <div className={styles.previewLoader}>
                      <Icon name="spinner" loading size="huge" />
                      <span>Loading preview...</span>
                    </div>
                  )}

                  {!imageLoading && imagePreview && (
                    <div className={styles.imageContainer}>
                      <img
                        src={imagePreview}
                        alt={item.name}
                        className={styles.previewImage}
                        onError={() => setImagePreview(null)}
                      />
                      <div className={styles.imageOverlay}>
                        <Button
                          circular
                          icon="expand"
                          className={styles.expandButton}
                          onClick={() => window.open(imagePreview, '_blank')}
                        />
                      </div>
                    </div>
                  )}

                  {!imageLoading && !imagePreview && (
                    <div className={styles.previewPlaceholder}>
                      <Icon name="image outline" size="huge" />
                      <span>Preview not available</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isVideo(item) && (
              <div className={styles.previewSection}>
                <div className={styles.previewContainer}>
                  {mediaLoading && (
                    <div className={styles.previewLoader}>
                      <Icon name="spinner" loading size="huge" />
                      <span>Loading video...</span>
                    </div>
                  )}

                  {!mediaLoading && mediaPreviewUrl && (
                    <div className={styles.videoContainer}>
                      <video
                        ref={videoRef}
                        src={mediaPreviewUrl}
                        controls
                        className={styles.previewVideo}
                        onError={() => setMediaPreviewUrl(null)}
                      >
                        <track kind="captions" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  {!mediaLoading && !mediaPreviewUrl && (
                    <div className={styles.videoPlaceholder}>
                      <div className={styles.videoIconWrapper}>
                        <Icon name="video" size="huge" />
                      </div>
                      <span className={styles.documentName}>{item.name}</span>
                      <span className={styles.fileSize}>
                        <Icon name="hdd" /> {formatBytes(item.size)}
                      </span>
                      <span className={styles.documentHint}>
                        Video preview not available.
                        {shareLink.isDownloadable && ' Click download to watch the video.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isAudio(item) && (
              <div className={styles.previewSection}>
                <div className={styles.audioPreviewContainer}>
                  {mediaLoading && (
                    <div className={styles.previewLoader}>
                      <Icon name="spinner" loading size="huge" />
                      <span>Loading audio...</span>
                    </div>
                  )}

                  {!mediaLoading && mediaPreviewUrl && (
                    <div className={styles.audioContainer}>
                      <div className={styles.audioIcon}>
                        <Icon name="music" size="huge" />
                      </div>
                      <div className={styles.audioPlayerWrapper}>
                        <span className={styles.audioFileName}>{item.name}</span>
                        <audio
                          ref={audioRef}
                          src={mediaPreviewUrl}
                          controls
                          className={styles.audioPlayer}
                          onError={() => setMediaPreviewUrl(null)}
                        >
                          <track kind="captions" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  )}

                  {!mediaLoading && !mediaPreviewUrl && (
                    <div className={styles.audioPlaceholder}>
                      <div className={styles.audioIconWrapperLarge}>
                        <Icon name="music" size="huge" />
                      </div>
                      <span className={styles.documentName}>{item.name}</span>
                      <span className={styles.fileSize}>
                        <Icon name="hdd" /> {formatBytes(item.size)}
                      </span>
                      <span className={styles.documentHint}>
                        Audio preview not available.
                        {shareLink.isDownloadable && ' Click download to listen.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isPdf(item) && (
              <div className={styles.previewSection}>
                <div className={styles.pdfPreviewContainer}>
                  {mediaLoading && (
                    <div className={styles.previewLoader}>
                      <Icon name="spinner" loading size="huge" />
                      <span>Loading PDF...</span>
                    </div>
                  )}

                  {!mediaLoading && mediaPreviewUrl && (
                    <div className={styles.pdfContainer}>
                      <iframe
                        src={mediaPreviewUrl}
                        className={styles.pdfViewer}
                        title={item.name}
                      />
                      <div className={styles.pdfOverlay}>
                        <Button
                          circular
                          icon="expand"
                          className={styles.expandButton}
                          onClick={() => window.open(mediaPreviewUrl, '_blank')}
                        />
                      </div>
                    </div>
                  )}

                  {!mediaLoading && !mediaPreviewUrl && (
                    <div className={styles.pdfPlaceholder}>
                      <div className={styles.pdfIconWrapper}>
                        <Icon name="file pdf" size="huge" />
                      </div>
                      <span className={styles.documentName}>{item.name}</span>
                      <span className={styles.fileSize}>
                        <Icon name="hdd" /> {formatBytes(item.size)}
                      </span>
                      <span className={styles.documentHint}>
                        PDF preview not available.
                        {shareLink.isDownloadable && ' Click download to view the document.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isOfficeDocument(item) && (
              <div className={styles.previewSection}>
                <div className={styles.previewContainer}>
                  <div className={styles.officePlaceholder}>
                    <div className={`${styles.officeIconWrapper} ${styles[getOfficeType(item)]}`}>
                      <Icon name={getFileIcon(item)} size="huge" />
                    </div>
                    <span className={styles.documentName}>{item.name}</span>
                    <span className={styles.fileSize}>
                      <Icon name="hdd" /> {formatBytes(item.size)}
                    </span>
                    <span className={styles.documentHint}>
                      Office documents cannot be previewed in the browser.
                      {shareLink.isDownloadable && ' Click download to open in Microsoft Office.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {isTextFile(item) && (
              <div className={styles.previewSection}>
                <div className={styles.codePreviewContainer}>
                  {textLoading && (
                    <div className={styles.previewLoader}>
                      <Icon name="spinner" loading size="huge" />
                      <span>Loading file...</span>
                    </div>
                  )}

                  {!textLoading && textContent !== null && highlightedCode && (
                    <div className={styles.codeWrapper}>
                      <div className={styles.codeHeader}>
                        <span className={styles.codeLanguage}>
                          <Icon name="code" /> {getLanguageFromFile(item)}
                        </span>
                        <span className={styles.codeFileName}>{item.name}</span>
                      </div>
                      <pre className={styles.codeContent}>
                        {/* eslint-disable-next-line react/no-danger */}
                        <code dangerouslySetInnerHTML={highlightedCode} />
                      </pre>
                    </div>
                  )}

                  {!textLoading && textContent === null && (
                    <div className={styles.codePlaceholder}>
                      <div className={styles.codeIconWrapper}>
                        <Icon name="code" size="huge" />
                      </div>
                      <span className={styles.documentName}>{item.name}</span>
                      <span className={styles.fileSize}>
                        <Icon name="hdd" /> {formatBytes(item.size)}
                      </span>
                      <span className={styles.documentHint}>
                        Unable to load file preview.
                        {shareLink.isDownloadable && ' Click download to view the file.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isArchive(item) && (
              <div className={styles.previewSection}>
                <div className={styles.previewContainer}>
                  <div className={styles.archivePlaceholder}>
                    <div className={styles.archiveIconWrapper}>
                      <Icon name="file archive" size="huge" />
                    </div>
                    <span className={styles.documentName}>{item.name}</span>
                    <span className={styles.fileSize}>
                      <Icon name="hdd" /> {formatBytes(item.size)}
                    </span>
                    <span className={styles.documentHint}>
                      Archive files cannot be previewed in the browser.
                      {shareLink.isDownloadable && ' Click download to extract and view contents.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {!isImage(item) &&
              !isVideo(item) &&
              !isAudio(item) &&
              !isPdf(item) &&
              !isOfficeDocument(item) &&
              !isTextFile(item) &&
              !isArchive(item) && (
                <div className={styles.previewSection}>
                  <div className={styles.previewContainer}>
                    <div className={styles.genericPlaceholder}>
                      <div className={styles.genericIconWrapper}>
                        <Icon name={getFileIcon(item)} size="huge" />
                      </div>
                      <span className={styles.documentName}>{item.name}</span>
                      <span className={styles.fileSize}>
                        <Icon name="hdd" /> {formatBytes(item.size)}
                      </span>
                      <span className={styles.documentHint}>
                        This file type cannot be previewed in the browser.
                        {shareLink.isDownloadable && ' Click download to view the file.'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            <div className={styles.infoSection}>
              <div className={styles.infoCompact}>
                <span className={styles.infoItem}>
                  <Icon name="hdd" className={styles.infoIcon} /> {formatBytes(item.size)}
                </span>
                <span className={styles.infoItem}>
                  <Icon name="file" className={styles.infoIcon} /> {item.mimeType}
                </span>
                <span className={styles.infoItem}>
                  <Icon name="clock" className={styles.infoIcon} /> {formatDate(item.createdAt)}
                </span>
                {shareLink.expiresAt && (
                  <span className={styles.infoItem}>
                    <Icon name="hourglass end" className={styles.infoIcon} /> Expires:{' '}
                    {formatDate(shareLink.expiresAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {(resourceType === 'folder' || resourceType === 'space') && (
          <div>
            {item.description && (
              <Card fluid className={styles.contentCard}>
                <Card.Content>
                  <p className={styles.description}>{item.description}</p>
                </Card.Content>
              </Card>
            )}

            {included.folders && included.folders.length > 0 && (
              <Card fluid className={styles.contentCard}>
                <Card.Header>
                  <Icon name="folder" /> Folders ({included.folders.length})
                </Card.Header>
                <Card.Content>
                  <Table basic="very" className={styles.table}>
                    <Table.Body>
                      {included.folders.map((folder) => (
                        <Table.Row key={folder.id}>
                          <Table.Cell width={12}>
                            <Icon name="folder" color="yellow" />
                            <span>{folder.name}</span>
                          </Table.Cell>
                          <Table.Cell textAlign="right" width={4}>
                            <span>{formatDate(folder.createdAt)}</span>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </Card.Content>
              </Card>
            )}

            {included.files && included.files.length > 0 && (
              <Card fluid className={styles.contentCard}>
                <Card.Header>
                  <Icon name="file" /> Files ({included.files.length})
                </Card.Header>
                <Card.Content>
                  <Table basic="very" selectable className={styles.table}>
                    <Table.Body>
                      {included.files.map((file) => (
                        <Table.Row
                          key={file.id}
                          className={styles.clickableRow}
                          onClick={() => handleFileClick(file)}
                        >
                          <Table.Cell width={8}>
                            <Icon name={getFileIcon(file)} />
                            <span>{file.name}</span>
                          </Table.Cell>
                          <Table.Cell width={4}>
                            <span>{formatBytes(file.size)}</span>
                          </Table.Cell>
                          <Table.Cell textAlign="right" width={4}>
                            <span>{formatDate(file.createdAt)}</span>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </Card.Content>
              </Card>
            )}

            {(!included.folders || included.folders.length === 0) &&
              (!included.files || included.files.length === 0) && (
                <div className={styles.emptyState}>
                  <Icon size="huge" name="folder open" />
                  <h2>This {resourceType} is empty</h2>
                  <p>No files or folders to display</p>
                </div>
              )}
          </div>
        )}

        {previewModalOpen && (
          <div className={styles.previewModalOverlay}>
            <div className={styles.previewModalContent}>
              <div className={styles.previewModalHeader}>
                <div className={styles.previewHeaderLeft}>
                  <Button className={styles.previewBackButton} onClick={handleClosePreviewModal}>
                    <Icon name="arrow left" />
                  </Button>
                </div>
                <div className={styles.previewHeaderCenter}>
                  <Icon
                    name={previewFile ? getFileIcon(previewFile) : 'file'}
                    className={styles.previewFileIcon}
                  />
                  <span className={styles.previewFileName}>
                    {previewFile?.name || 'File Preview'}
                  </span>
                </div>
                <div className={styles.previewHeaderRight}>
                  {shareData?.shareLink?.isDownloadable && (
                    <Button
                      icon
                      labelPosition="left"
                      className={styles.previewDownloadButton}
                      onClick={handleDownloadPreviewFile}
                      loading={previewFileDownloadLoading}
                    >
                      <Icon name="download" />
                      Download
                    </Button>
                  )}
                </div>
              </div>

              <div className={styles.previewBody}>
                {previewFileLoading && (
                  <div className={styles.previewLoader}>
                    <Icon name="spinner" loading size="huge" />
                    <span>Loading preview...</span>
                  </div>
                )}

                {!previewFileLoading && previewFile && isImage(previewFile) && previewFileUrl && (
                  <div className={styles.previewImageWrapper}>
                    <img
                      src={previewFileUrl}
                      alt={previewFile.name}
                      className={styles.previewModalImage}
                    />
                  </div>
                )}

                {!previewFileLoading && previewFile && isVideo(previewFile) && previewFileUrl && (
                  <div className={styles.previewVideoWrapper}>
                    <video src={previewFileUrl} controls className={styles.previewModalVideo}>
                      <track kind="captions" />
                    </video>
                  </div>
                )}

                {!previewFileLoading && previewFile && isAudio(previewFile) && previewFileUrl && (
                  <div className={styles.previewAudioWrapper}>
                    <div className={styles.previewAudioIcon}>
                      <Icon name="music" />
                    </div>
                    <span className={styles.previewAudioName}>{previewFile.name}</span>
                    <audio src={previewFileUrl} controls className={styles.previewAudioPlayer}>
                      <track kind="captions" />
                    </audio>
                  </div>
                )}

                {!previewFileLoading && previewFile && isPdf(previewFile) && previewFileUrl && (
                  <div className={styles.previewPdfWrapper}>
                    <iframe
                      src={previewFileUrl}
                      className={styles.previewModalPdf}
                      title={previewFile.name}
                    />
                  </div>
                )}

                {!previewFileLoading &&
                  previewFile &&
                  isTextFile(previewFile) &&
                  previewTextContent !== null &&
                  highlightedPreviewCode && (
                    <div className={styles.previewCodeWrapper}>
                      <div className={styles.previewCodeHeader}>
                        <span className={styles.previewCodeLanguage}>
                          <Icon name="code" /> {getHljsLanguageForFile(previewFile)}
                        </span>
                      </div>
                      <pre className={styles.previewCodeContent}>
                        {/* eslint-disable-next-line react/no-danger */}
                        <code dangerouslySetInnerHTML={highlightedPreviewCode} />
                      </pre>
                    </div>
                  )}

                {!previewFileLoading &&
                  previewFile &&
                  !isImage(previewFile) &&
                  !isVideo(previewFile) &&
                  !isAudio(previewFile) &&
                  !isPdf(previewFile) &&
                  !isTextFile(previewFile) && (
                    <div className={styles.previewNoPreview}>
                      <div className={styles.previewNoPreviewIcon}>
                        <Icon name={getFileIcon(previewFile)} size="huge" />
                      </div>
                      <span className={styles.previewNoPreviewName}>{previewFile.name}</span>
                      <span className={styles.previewNoPreviewSize}>
                        <Icon name="hdd" /> {formatBytes(previewFile.size)}
                      </span>
                      <span className={styles.previewNoPreviewHint}>
                        This file type cannot be previewed in the browser.
                      </span>
                    </div>
                  )}

                {!previewFileLoading && previewFile && !previewFileUrl && !previewTextContent && (
                  <div className={styles.previewNoPreview}>
                    <div className={styles.previewNoPreviewIcon}>
                      <Icon name={getFileIcon(previewFile)} size="huge" />
                    </div>
                    <span className={styles.previewNoPreviewName}>{previewFile.name}</span>
                    <span className={styles.previewNoPreviewSize}>
                      <Icon name="hdd" /> {formatBytes(previewFile.size)}
                    </span>
                    <span className={styles.previewNoPreviewHint}>Preview not available</span>
                  </div>
                )}
              </div>

              {previewFile && (
                <div className={styles.previewFooter}>
                  <div className={styles.previewInfoSection}>
                    <span className={styles.previewInfoItem}>
                      <Icon name="hdd" className={styles.previewInfoIcon} />{' '}
                      {formatBytes(previewFile.size)}
                    </span>
                    <span className={styles.previewInfoItem}>
                      <Icon name="file" className={styles.previewInfoIcon} /> {previewFile.mimeType}
                    </span>
                    <span className={styles.previewInfoItem}>
                      <Icon name="clock" className={styles.previewInfoIcon} />{' '}
                      {formatDate(previewFile.createdAt)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicShare;
