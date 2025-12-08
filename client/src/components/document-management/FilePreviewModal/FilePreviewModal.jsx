/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import hljs from 'highlight.js';
import selectors from '../../../selectors';
import { formatBytes } from '../../../utils/helpers';

import 'highlight.js/styles/vs2015.css';
import styles from './FilePreviewModal.module.scss';

const FilePreviewModal = React.memo(
  ({ file, files, onClose, onShare, onDownload, onNavigate, canShare }) => {
    const accessToken = useSelector(selectors.selectAccessToken);
    const [mediaUrl, setMediaUrl] = React.useState(null);
    const [mediaError, setMediaError] = React.useState(false);
    const [mediaLoading, setMediaLoading] = React.useState(false);
    const [textContent, setTextContent] = React.useState(null);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

    const isImage = useCallback((f) => {
      if (f.mimeType && f.mimeType.startsWith('image/')) return true;
      if (f.name) {
        const ext = f.name.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp'].includes(ext);
      }
      return false;
    }, []);

    const isVideo = useCallback((f) => {
      if (f.mimeType && f.mimeType.startsWith('video/')) return true;
      if (f.name) {
        const ext = f.name.split('.').pop().toLowerCase();
        return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm4v'].includes(ext);
      }
      return false;
    }, []);

    const isAudio = useCallback((f) => {
      if (f.mimeType && f.mimeType.startsWith('audio/')) return true;
      if (f.name) {
        const ext = f.name.split('.').pop().toLowerCase();
        return ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma'].includes(ext);
      }
      return false;
    }, []);

    const isPdf = useCallback((f) => {
      if (f.mimeType === 'application/pdf') return true;
      if (f.name) {
        const ext = f.name.split('.').pop().toLowerCase();
        return ext === 'pdf';
      }
      return false;
    }, []);

    const isOfficeDocument = useCallback((f) => {
      const officeMimeTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ];
      if (f.mimeType && officeMimeTypes.includes(f.mimeType)) return true;
      if (f.name) {
        const ext = f.name.split('.').pop().toLowerCase();
        return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);
      }
      return false;
    }, []);

    const isArchive = useCallback((f) => {
      const archiveMimeTypes = [
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/vnd.rar',
        'application/x-7z-compressed',
        'application/x-tar',
        'application/gzip',
      ];
      if (f.mimeType && archiveMimeTypes.includes(f.mimeType)) return true;
      if (f.name) {
        const ext = f.name.split('.').pop().toLowerCase();
        return ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'tgz'].includes(ext);
      }
      return false;
    }, []);

    const isTextFile = useCallback((f) => {
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
      if (f.mimeType && (textMimeTypes.includes(f.mimeType) || f.mimeType.startsWith('text/'))) {
        return true;
      }
      if (f.name) {
        const ext = f.name.split('.').pop().toLowerCase();
        return [
          'txt',
          'md',
          'markdown',
          'csv',
          'tsv',
          'log',
          'html',
          'htm',
          'css',
          'scss',
          'sass',
          'less',
          'js',
          'jsx',
          'ts',
          'tsx',
          'mjs',
          'cjs',
          'py',
          'pyw',
          'java',
          'kt',
          'c',
          'cpp',
          'h',
          'hpp',
          'cs',
          'go',
          'rs',
          'rb',
          'php',
          'swift',
          'scala',
          'sh',
          'bash',
          'zsh',
          'ps1',
          'bat',
          'cmd',
          'json',
          'xml',
          'yaml',
          'yml',
          'toml',
          'ini',
          'cfg',
          'conf',
          'env',
          'sql',
          'vue',
          'svelte',
        ].includes(ext);
      }
      return false;
    }, []);

    const getLanguageFromFile = useCallback((f) => {
      if (!f.name) return 'text';
      const ext = f.name.split('.').pop().toLowerCase();
      const langMap = {
        js: 'javascript',
        jsx: 'javascript',
        mjs: 'javascript',
        cjs: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        py: 'python',
        pyw: 'python',
        java: 'java',
        kt: 'kotlin',
        c: 'c',
        cpp: 'cpp',
        h: 'c',
        hpp: 'cpp',
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

    const getFileIcon = useCallback((f) => {
      if (!f.name) return 'file outline';
      const ext = f.name.split('.').pop().toLowerCase();
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
          return 'file code';
      }
    }, []);

    const getOfficeType = useCallback((f) => {
      if (!f.name) return null;
      const ext = f.name.split('.').pop().toLowerCase();
      if (['doc', 'docx'].includes(ext)) return 'word';
      if (['xls', 'xlsx'].includes(ext)) return 'excel';
      if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
      return null;
    }, []);

    const currentIsImage = isImage(file);
    const currentIsVideo = isVideo(file);
    const currentIsAudio = isAudio(file);
    const currentIsPdf = isPdf(file);
    const currentIsOffice = isOfficeDocument(file);
    const currentIsArchive = isArchive(file);
    const currentIsText = isTextFile(file);

    const highlightedCode = useMemo(() => {
      if (!textContent || !file) return null;
      const language = getLanguageFromFile(file);
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
      } catch {
        return { __html: textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;') };
      }
    }, [textContent, file, getLanguageFromFile]);

    const canPreview = useCallback(
      (f) => isImage(f) || isVideo(f) || isAudio(f) || isPdf(f) || isTextFile(f),
      [isImage, isVideo, isAudio, isPdf, isTextFile],
    );

    const previewableFiles = files.filter((f) => f.type === 'file' && canPreview(f));
    const currentIndex = previewableFiles.findIndex((f) => f.id === file.id);
    const totalFiles = previewableFiles.length;

    const handlePrevious = () => {
      if (currentIndex > 0) {
        onNavigate(previewableFiles[currentIndex - 1]);
      }
    };

    const handleNext = () => {
      if (currentIndex < totalFiles - 1) {
        onNavigate(previewableFiles[currentIndex + 1]);
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    React.useEffect(() => {
      const needsMediaUrl = currentIsImage || currentIsVideo || currentIsAudio || currentIsPdf;
      if (!needsMediaUrl || !file.id || !accessToken) {
        return undefined;
      }

      let isMounted = true;
      let currentUrl = null;
      const controller = new AbortController();

      const fetchMedia = async () => {
        setMediaLoading(true);
        setMediaError(false);

        try {
          const response = await fetch(`/api/files/${file.id}/download?inline=true`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch media: ${response.status}`);
          }

          const blob = await response.blob();

          if (blob.type.includes('text/html')) {
            throw new Error('Server returned HTML error page');
          }

          const url = URL.createObjectURL(blob);
          currentUrl = url;

          if (isMounted) {
            setMediaUrl(url);
            setMediaError(false);
            setMediaLoading(false);
          }
        } catch (error) {
          if (error.name !== 'AbortError' && isMounted) {
            setMediaError(true);
            setMediaLoading(false);
          }
        }
      };

      fetchMedia();

      return () => {
        isMounted = false;
        controller.abort();
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }
      };
    }, [file.id, accessToken, currentIsImage, currentIsVideo, currentIsAudio, currentIsPdf]);

    React.useEffect(() => {
      if (!currentIsText || !file.id || !accessToken) {
        setTextContent(null);
        return undefined;
      }

      let isMounted = true;
      const controller = new AbortController();

      const fetchText = async () => {
        setMediaLoading(true);
        setMediaError(false);

        try {
          const response = await fetch(`/api/files/${file.id}/download?inline=true`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch text: ${response.status}`);
          }

          const blob = await response.blob();
          const text = await blob.text();
          const truncatedText =
            text.length > 50000 ? `${text.substring(0, 50000)}\n\n... (truncated)` : text;

          if (isMounted) {
            setTextContent(truncatedText);
            setMediaError(false);
            setMediaLoading(false);
          }
        } catch (error) {
          if (error.name !== 'AbortError' && isMounted) {
            setMediaError(true);
            setMediaLoading(false);
          }
        }
      };

      fetchText();

      return () => {
        isMounted = false;
        controller.abort();
      };
    }, [file.id, accessToken, currentIsText]);

    React.useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      document.addEventListener('keydown', handleKeyPress);
      window.addEventListener('resize', handleResize);

      return () => {
        document.removeEventListener('keydown', handleKeyPress);
        window.removeEventListener('resize', handleResize);
      };
    }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div className={styles.overlay} onClick={onClose}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              {canShare && (
                <Button icon className={styles.headerButton} onClick={onShare}>
                  <Icon name="user plus" />
                  Share
                </Button>
              )}
              <Button icon className={styles.headerButton} onClick={onDownload}>
                <Icon name="download" />
                Download
              </Button>
            </div>

            <div className={styles.headerCenter}>
              <Icon name={getFileIcon(file)} className={styles.fileIcon} />
              <span className={styles.fileName}>{file.name}</span>
            </div>

            <div className={styles.headerRight}>
              <Button
                icon
                className={styles.iconButton}
                onClick={handlePrevious}
                disabled={currentIndex === 0 || currentIndex === -1}
              >
                <Icon name="angle left" />
              </Button>
              <span className={styles.pageInfo}>
                {currentIndex + 1} / {totalFiles}
              </span>
              <Button
                icon
                className={styles.iconButton}
                onClick={handleNext}
                disabled={currentIndex === totalFiles - 1}
              >
                <Icon name="angle right" />
              </Button>
              <Button icon className={styles.iconButton} onClick={onClose}>
                <Icon name="close" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {/* Image Preview */}
            {currentIsImage && (
              <div className={styles.imagePreview}>
                {mediaLoading && (
                  <div className={styles.previewLoader}>
                    <Icon name="spinner" loading size="huge" />
                    <span>Loading image...</span>
                  </div>
                )}
                {!mediaLoading && mediaUrl && !mediaError && (
                  <img
                    src={mediaUrl}
                    alt={file.name}
                    className={styles.previewImage}
                    style={{
                      maxWidth: '100%',
                      maxHeight: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 160px)',
                      objectFit: 'contain',
                    }}
                  />
                )}
                {!mediaLoading && mediaError && (
                  <div className={styles.previewPlaceholder}>
                    <Icon name="image outline" size="huge" />
                    <span className={styles.documentName}>{file.name}</span>
                    <span className={styles.documentHint}>Preview not available</span>
                  </div>
                )}
              </div>
            )}

            {/* Video Preview */}
            {currentIsVideo && (
              <div className={styles.videoPreview}>
                {mediaLoading && (
                  <div className={styles.previewLoader}>
                    <Icon name="spinner" loading size="huge" />
                    <span>Loading video...</span>
                  </div>
                )}
                {!mediaLoading && mediaUrl && !mediaError && (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    src={mediaUrl}
                    controls
                    autoPlay
                    className={styles.previewVideo}
                    style={{
                      maxWidth: '100%',
                      maxHeight: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 160px)',
                      objectFit: 'contain',
                    }}
                  />
                )}
                {!mediaLoading && mediaError && (
                  <div className={styles.previewPlaceholder}>
                    <div className={styles.videoIconWrapper}>
                      <Icon name="video" size="huge" />
                    </div>
                    <span className={styles.documentName}>{file.name}</span>
                    <span className={styles.fileSize}>
                      <Icon name="hdd" /> {file.size ? formatBytes(file.size) : 'Unknown size'}
                    </span>
                    <span className={styles.documentHint}>
                      Video preview not available. Click download to watch.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Audio Preview */}
            {currentIsAudio && (
              <div className={styles.audioPreview}>
                {mediaLoading && (
                  <div className={styles.previewLoader}>
                    <Icon name="spinner" loading size="huge" />
                    <span>Loading audio...</span>
                  </div>
                )}
                {!mediaLoading && mediaUrl && !mediaError && (
                  <div className={styles.audioContainer}>
                    <div className={styles.audioIcon}>
                      <Icon name="music" size="huge" />
                    </div>
                    <div className={styles.audioPlayerWrapper}>
                      <span className={styles.audioFileName}>{file.name}</span>
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <audio src={mediaUrl} controls className={styles.audioPlayer} />
                    </div>
                  </div>
                )}
                {!mediaLoading && mediaError && (
                  <div className={styles.previewPlaceholder}>
                    <div className={styles.audioIconWrapper}>
                      <Icon name="music" size="huge" />
                    </div>
                    <span className={styles.documentName}>{file.name}</span>
                    <span className={styles.fileSize}>
                      <Icon name="hdd" /> {file.size ? formatBytes(file.size) : 'Unknown size'}
                    </span>
                    <span className={styles.documentHint}>
                      Audio preview not available. Click download to listen.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* PDF Preview */}
            {currentIsPdf && (
              <div className={styles.pdfPreview}>
                {mediaLoading && (
                  <div className={styles.previewLoader}>
                    <Icon name="spinner" loading size="huge" />
                    <span>Loading PDF...</span>
                  </div>
                )}
                {!mediaLoading && mediaUrl && !mediaError && (
                  <iframe src={mediaUrl} className={styles.pdfViewer} title={file.name} />
                )}
                {!mediaLoading && mediaError && (
                  <div className={styles.previewPlaceholder}>
                    <div className={styles.pdfIconWrapper}>
                      <Icon name="file pdf" size="huge" />
                    </div>
                    <span className={styles.documentName}>{file.name}</span>
                    <span className={styles.fileSize}>
                      <Icon name="hdd" /> {file.size ? formatBytes(file.size) : 'Unknown size'}
                    </span>
                    <span className={styles.documentHint}>
                      PDF preview not available. Click download to view.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Text/Code Preview */}
            {currentIsText && (
              <div className={styles.codePreview}>
                {mediaLoading && (
                  <div className={styles.previewLoader}>
                    <Icon name="spinner" loading size="huge" />
                    <span>Loading file...</span>
                  </div>
                )}
                {!mediaLoading && textContent !== null && highlightedCode && (
                  <div className={styles.codeWrapper}>
                    <div className={styles.codeHeader}>
                      <span className={styles.codeLanguage}>
                        <Icon name="code" /> {getLanguageFromFile(file)}
                      </span>
                      <span className={styles.codeFileName}>{file.name}</span>
                    </div>
                    <pre className={styles.codeContent}>
                      {/* eslint-disable-next-line react/no-danger */}
                      <code dangerouslySetInnerHTML={highlightedCode} />
                    </pre>
                  </div>
                )}
                {!mediaLoading && (textContent === null || mediaError) && (
                  <div className={styles.previewPlaceholder}>
                    <div className={styles.codeIconWrapper}>
                      <Icon name="code" size="huge" />
                    </div>
                    <span className={styles.documentName}>{file.name}</span>
                    <span className={styles.fileSize}>
                      <Icon name="hdd" /> {file.size ? formatBytes(file.size) : 'Unknown size'}
                    </span>
                    <span className={styles.documentHint}>
                      Unable to load file preview. Click download to view.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Office Document Placeholder */}
            {currentIsOffice && (
              <div className={styles.previewPlaceholder}>
                <div className={`${styles.officeIconWrapper} ${styles[getOfficeType(file)]}`}>
                  <Icon name={getFileIcon(file)} size="huge" />
                </div>
                <span className={styles.documentName}>{file.name}</span>
                <span className={styles.fileSize}>
                  <Icon name="hdd" /> {file.size ? formatBytes(file.size) : 'Unknown size'}
                </span>
                <span className={styles.documentHint}>
                  Office documents cannot be previewed in the browser.
                  <br />
                  Click download to open in Microsoft Office.
                </span>
              </div>
            )}

            {/* Archive Placeholder */}
            {currentIsArchive && (
              <div className={styles.previewPlaceholder}>
                <div className={styles.archiveIconWrapper}>
                  <Icon name="file archive" size="huge" />
                </div>
                <span className={styles.documentName}>{file.name}</span>
                <span className={styles.fileSize}>
                  <Icon name="hdd" /> {file.size ? formatBytes(file.size) : 'Unknown size'}
                </span>
                <span className={styles.documentHint}>
                  Archive files cannot be previewed in the browser.
                  <br />
                  Click download to extract and view contents.
                </span>
              </div>
            )}

            {/* Generic File Placeholder */}
            {!currentIsImage &&
              !currentIsVideo &&
              !currentIsAudio &&
              !currentIsPdf &&
              !currentIsText &&
              !currentIsOffice &&
              !currentIsArchive && (
                <div className={styles.previewPlaceholder}>
                  <div className={styles.genericIconWrapper}>
                    <Icon name={getFileIcon(file)} size="huge" />
                  </div>
                  <span className={styles.documentName}>{file.name}</span>
                  <span className={styles.fileSize}>
                    <Icon name="hdd" /> {file.size ? formatBytes(file.size) : 'Unknown size'}
                  </span>
                  <span className={styles.documentHint}>
                    This file type cannot be previewed in the browser.
                    <br />
                    Click download to view the file.
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  },
);

FilePreviewModal.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    mimeType: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string,
      mimeType: PropTypes.string,
    }),
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onShare: PropTypes.func,
  onDownload: PropTypes.func,
  onNavigate: PropTypes.func.isRequired,
  canShare: PropTypes.bool,
};

FilePreviewModal.defaultProps = {
  onShare: () => {},
  onDownload: () => {},
  canShare: false,
};

export default FilePreviewModal;
