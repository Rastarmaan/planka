/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, Form, Icon, Input, Message, Segment, Table } from 'semantic-ui-react';
import { toast } from 'react-hot-toast';
import publicApi from '../../api/public';
import { formatBytes, formatDate } from '../../utils/helpers';

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
  const initialLoadRef = useRef(false);
  const passwordRef = useRef('');

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
      default:
        return 'file outline';
    }
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
        const blob = await publicApi.downloadPublicFile(token, password || null);
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
    return () => {
      if (imagePreview) {
        window.URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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
                  <Table basic="very" className={styles.table}>
                    <Table.Body>
                      {included.files.map((file) => (
                        <Table.Row key={file.id}>
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
      </div>
    </div>
  );
}

export default PublicShare;
