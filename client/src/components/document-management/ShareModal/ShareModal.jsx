/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Icon, Modal, Divider, Label, List, Dropdown } from 'semantic-ui-react';
import toast from 'react-hot-toast';
import { Input } from '../../../lib/custom-ui';
import LinkSettingsModal from '../LinkSettingsModal/LinkSettingsModal';
import selectors from '../../../selectors';
import usersApi from '../../../api/users';
import permissionsApi from '../../../api/permissions';
import shareLinksApi from '../../../api/share-links';

import styles from './ShareModal.module.scss';

const ShareModal = React.memo(({ resource, resourceType, isOpen, onClose, onCreateShareLink }) => {
  const [t] = useTranslation();
  const currentUser = useSelector(selectors.selectCurrentUser);
  const allActiveUsers = useSelector(selectors.selectActiveUsers);
  const accessToken = useSelector(selectors.selectAccessToken);

  const [selectedUsers, setSelectedUsers] = useState([]);

  const [linkEnabled, setLinkEnabled] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkSettings, setLinkSettings] = useState({});
  const [showLinkSettings, setShowLinkSettings] = useState(false);
  const [usersOptionsFromApi, setUsersOptionsFromApi] = useState(null);

  const [sharedUsers, setSharedUsers] = useState([]);
  const [loadingSharedUsers, setLoadingSharedUsers] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);
  const [existingShareLink, setExistingShareLink] = useState(null);
  const [loadingShareLink, setLoadingShareLink] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchUsers = async () => {
      try {
        const res = await usersApi.getUsers();
        const items = (res && res.items) || (res && res.users) || null;
        if (!mounted) return;
        if (items && Array.isArray(items)) {
          setUsersOptionsFromApi(
            items
              .filter((u) => u.id !== currentUser?.id)
              .map((user) => ({
                key: user.id,
                text: user.name || user.username,
                value: user.id,
                searchable: `${user.name || user.username} ${user.email || ''}`.toLowerCase(),
                image: {
                  avatar: true,
                  src: (() => {
                    if (user.avatarUrl && user.avatarUrl.indexOf('http') === 0) {
                      return user.avatarUrl;
                    }
                    if (user.avatarUrl) {
                      return `${window.location.origin}${user.avatarUrl}`;
                    }
                    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name || user.username,
                    )}&background=random`;
                  })(),
                },
                description: user.email,
              })),
          );
        }
      } catch (err) {
        // ignore - will use Redux users as fallback
      }
    };

    fetchUsers();

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const fetchSharedUsers = useCallback(async () => {
    if (!resource?.id || !resourceType) return;

    setLoadingSharedUsers(true);
    try {
      const res = await permissionsApi.getPermissions(
        {
          resourceType,
          resourceId: resource.id.toString(),
        },
        {
          Authorization: `Bearer ${accessToken}`,
        },
      );

      const items = (res && res.items) || [];
      setSharedUsers(items);
    } catch {
      // Error fetching permissions - ignore
    } finally {
      setLoadingSharedUsers(false);
    }
  }, [resource, resourceType, accessToken]);

  useEffect(() => {
    if (isOpen && resource?.id) {
      fetchSharedUsers();
    }
  }, [isOpen, resource, fetchSharedUsers]);

  const fetchExistingShareLink = useCallback(async () => {
    if (!resource?.id || !resourceType) return;

    setLoadingShareLink(true);
    try {
      const res = await shareLinksApi.getShareLinks(resourceType, resource.id.toString(), {
        Authorization: `Bearer ${accessToken}`,
      });

      const items = (res && res.items) || [];
      if (items.length > 0) {
        const link = items[0];
        setExistingShareLink(link);
        setLinkEnabled(true);
        setShareLink(`${window.location.origin}/public/${link.token}`);
        setLinkSettings({
          isDownloadable: link.isDownloadable,
          expiresAt: link.expiresAt,
          password: link.password ? '********' : null,
        });
      }
    } catch {
      // Error fetching share link - ignore
    } finally {
      setLoadingShareLink(false);
    }
  }, [resource, resourceType, accessToken]);

  useEffect(() => {
    if (isOpen && resource?.id) {
      fetchExistingShareLink();
    }
  }, [isOpen, resource, fetchExistingShareLink]);

  const handleRemoveAccess = useCallback(
    async (permission) => {
      setRemovingUserId(permission.id);
      try {
        await permissionsApi.deletePermission(permission.id, {
          Authorization: `Bearer ${accessToken}`,
        });

        setSharedUsers((prev) => prev.filter((p) => p.id !== permission.id));
        toast.success(t('documentManagement.accessRevoked'));
      } catch (err) {
        toast.error(t('documentManagement.failedToRevokeAccess'));
      } finally {
        setRemovingUserId(null);
      }
    },
    [accessToken, t],
  );

  const availableUsers = useMemo(() => {
    const source =
      usersOptionsFromApi ||
      (allActiveUsers || [])
        .filter((user) => user.id !== currentUser?.id)
        .map((user) => ({
          key: user.id,
          text: user.name || user.username,
          value: user.id,
          image: {
            avatar: true,
            src: (() => {
              if (user.avatarUrl && user.avatarUrl.indexOf('http') === 0) {
                return user.avatarUrl;
              }
              if (user.avatarUrl) {
                return `${window.location.origin}${user.avatarUrl}`;
              }
              return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=random`;
            })(),
          },
          description: user.email,
        }));

    return source;
  }, [usersOptionsFromApi, allActiveUsers, currentUser]);

  const usersWithAccess = useMemo(() => {
    if (!currentUser) return [];
    return [
      {
        id: currentUser.id,
        name: currentUser.name || currentUser.username,
        email: currentUser.email,
        avatar: (() => {
          if (!currentUser.avatarUrl) return null;
          if (currentUser.avatarUrl.indexOf('http') === 0) {
            return currentUser.avatarUrl;
          }
          return `${window.location.origin}${currentUser.avatarUrl}`;
        })(),
        role: 'Owner',
      },
    ];
  }, [currentUser]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedUsers([]);
      setLinkEnabled(false);
      setShareLink('');
      setCopied(false);
      setLinkSettings({});
      setSharedUsers([]);
      setExistingShareLink(null);
    }
  }, [isOpen]);

  const handleToggleLink = async (enabled) => {
    if (enabled) {
      if (!existingShareLink) {
        setShowLinkSettings(true);
      }
      setLinkEnabled(true);
      return;
    }

    if (existingShareLink && existingShareLink.id) {
      try {
        await shareLinksApi.deleteShareLink(existingShareLink.id.toString(), {
          Authorization: `Bearer ${accessToken}`,
        });
        setLinkEnabled(false);
        setShareLink('');
        setLinkSettings({});
        setExistingShareLink(null);
        toast.success(t('documentManagement.shareLinkDeleted'));
      } catch (err) {
        console.error('Failed to delete share link:', err);
        toast.error(t('documentManagement.failedToDeleteShareLink'));
      }
    } else {
      setLinkEnabled(false);
      setShareLink('');
      setLinkSettings({});
      setExistingShareLink(null);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveLinkSettings = async (settings) => {
    setLinkSettings(settings);
    setIsCreating(true);
    try {
      if (existingShareLink) {
        const updateData = { ...settings };
        if (updateData.password === '********') {
          delete updateData.password;
        }

        const result = await shareLinksApi.updateShareLink(existingShareLink.id, updateData, {
          Authorization: `Bearer ${accessToken}`,
        });

        if (result && result.item) {
          setExistingShareLink(result.item);
          toast.success(t('documentManagement.shareLinkUpdated'));
        }
      } else {
        const linkData = {
          resourceType: resourceType || 'file',
          resourceId: resource?.id,
          ...settings,
        };

        const result = await onCreateShareLink(linkData);

        if (result && (result.token || (result.item && result.item.token))) {
          const linkItem = result.item || result;
          const { token } = linkItem;
          const generatedLink = `${window.location.origin}/public/${token}`;
          setShareLink(generatedLink);
          setExistingShareLink(linkItem);

          toast.success(t('documentManagement.shareLinkCreated'));
        }
      }

      setShowLinkSettings(false);
    } catch (err) {
      if (!existingShareLink) {
        setLinkEnabled(false);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseLinkSettings = () => {
    setShowLinkSettings(false);
    if (!shareLink) {
      setLinkEnabled(false);
    }
  };

  const handleInviteUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const permissionFlags = {
        canView: true,
        canDownload: true,
        canEdit: true,
        canDelete: false,
        canShare: false,
      };

      const existingUsers = selectedUsers.filter((userValue) => /^\d+$/.test(userValue.toString()));

      if (existingUsers.length > 0) {
        const promises = existingUsers.map(async (userId) => {
          const permissionData = {
            resourceType: resourceType || 'file',
            resourceId: resource?.id,
            userId: userId.toString(),
            ...permissionFlags,
          };

          return permissionsApi.createPermission(permissionData, {
            Authorization: `Bearer ${accessToken}`,
          });
        });

        await Promise.all(promises);

        await fetchSharedUsers();
      }

      setSelectedUsers([]);

      toast.success(
        existingUsers.length === 1
          ? t('documentManagement.userAccessGranted')
          : `${existingUsers.length} ${t('documentManagement.usersAccessGranted')}`,
      );
    } catch (error) {
      toast.error(t('documentManagement.failedToInviteUsers'));
    }
  };

  return (
    <>
      <Modal open={isOpen} closeIcon size="small" onClose={onClose} className={styles.modal}>
        <Modal.Header className={styles.header}>
          <Icon name="share alternate" />
          {t('documentManagement.shareFile')} &apos;{resource?.name}&apos;
        </Modal.Header>
        <Modal.Content className={styles.content}>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{t('documentManagement.grantAccess')}</h4>
            <p className={styles.sectionDescription}>
              {t('documentManagement.grantAccessDescription')}
            </p>
            <div className={styles.inviteContainer}>
              <Dropdown
                placeholder={t('documentManagement.searchUsersToGrantAccess')}
                fluid
                multiple
                search
                selection
                options={availableUsers}
                value={selectedUsers}
                onChange={(e, { value }) => setSelectedUsers(value)}
                noResultsMessage={t('documentManagement.noUsersFound')}
                className={styles.userDropdown}
              />
            </div>
            {selectedUsers.length > 0 && (
              <Button
                positive
                size="small"
                content={t('documentManagement.addUser')}
                onClick={handleInviteUsers}
                style={{ marginTop: '8px' }}
              />
            )}
          </div>

          <Divider />

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{t('documentManagement.whoHasAccess')}</h4>
            {loadingSharedUsers ? (
              <div className={styles.loadingUsers}>
                <Icon loading name="spinner" />
                {t('common.loading')}
              </div>
            ) : (
              <List divided className={styles.userList}>
                {/* Owner */}
                {usersWithAccess.map((user) => (
                  <List.Item key={user.id} className={styles.userItem}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className={styles.avatar} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {(user.name || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <List.Content className={styles.userInfo}>
                      <List.Header>{user.name}</List.Header>
                      <List.Description>{user.email}</List.Description>
                    </List.Content>
                    <Label basic className={styles.roleLabel}>
                      {user.role}
                    </Label>
                  </List.Item>
                ))}
                {/* Shared users */}
                {sharedUsers.map((permission) => {
                  const user = permission.user || {};
                  const userName = user.name || user.username || t('common.unknownUser');
                  const userEmail = user.email || '';
                  const userAvatar = (() => {
                    if (!user.avatarUrl) return null;
                    if (user.avatarUrl.indexOf('http') === 0) return user.avatarUrl;
                    return `${window.location.origin}${user.avatarUrl}`;
                  })();

                  return (
                    <List.Item key={permission.id} className={styles.userItem}>
                      {userAvatar ? (
                        <img src={userAvatar} alt={userName} className={styles.avatar} />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <List.Content className={styles.userInfo}>
                        <List.Header>{userName}</List.Header>
                        <List.Description>{userEmail}</List.Description>
                      </List.Content>
                      <Label basic className={styles.roleLabel}>
                        {permission.canEdit
                          ? t('documentManagement.editor')
                          : t('documentManagement.viewer')}
                      </Label>
                      <Button
                        icon="trash"
                        size="mini"
                        negative
                        basic
                        loading={removingUserId === permission.id}
                        disabled={removingUserId !== null}
                        onClick={() => handleRemoveAccess(permission)}
                        className={styles.removeButton}
                        title={t('documentManagement.removeAccess')}
                      />
                    </List.Item>
                  );
                })}
                {sharedUsers.length === 0 && usersWithAccess.length <= 1 && (
                  <List.Item className={styles.noUsersItem}>
                    <List.Content>
                      <List.Description>
                        {t('documentManagement.noUsersWithAccess')}
                      </List.Description>
                    </List.Content>
                  </List.Item>
                )}
              </List>
            )}
          </div>

          <Divider />

          <div className={styles.section}>
            <div className={styles.shareLinkHeader}>
              <h4 className={styles.sectionTitle}>{t('documentManagement.shareLink')}</h4>
            </div>

            <div className={styles.linkToggle}>
              <Checkbox
                toggle
                checked={linkEnabled}
                onChange={(e, { checked }) => handleToggleLink(checked)}
                disabled={isCreating || loadingShareLink}
              />
              <span className={styles.toggleLabel}>
                {linkEnabled
                  ? t('documentManagement.shareableLinkCreated')
                  : t('documentManagement.createShareableLink')}
              </span>
              {linkEnabled && existingShareLink && (
                <Button
                  basic
                  size="tiny"
                  icon="setting"
                  content={t('documentManagement.linkSettings')}
                  onClick={() => setShowLinkSettings(true)}
                  className={styles.linkSettingsButton}
                />
              )}
            </div>

            {loadingShareLink && (
              <div className={styles.creating}>
                <Icon loading name="spinner" />
                {t('common.loading')}
              </div>
            )}

            {linkEnabled && shareLink && (
              <div className={styles.linkContainer}>
                <Input value={shareLink} readOnly fluid className={styles.linkInput} />
                <Button
                  className={styles.copyButton}
                  onClick={handleCopyLink}
                  positive
                  icon={copied ? 'check' : undefined}
                  content={copied ? t('documentManagement.copied') : t('documentManagement.copy')}
                />
              </div>
            )}

            {isCreating && (
              <div className={styles.creating}>
                <Icon loading name="spinner" />
                {t('documentManagement.creatingLink')}
              </div>
            )}
          </div>
        </Modal.Content>
      </Modal>

      <LinkSettingsModal
        isOpen={showLinkSettings}
        onClose={handleCloseLinkSettings}
        onSave={handleSaveLinkSettings}
        currentSettings={linkSettings}
      />
    </>
  );
});

ShareModal.propTypes = {
  resource: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  }),
  resourceType: PropTypes.oneOf(['space', 'folder', 'file']),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreateShareLink: PropTypes.func.isRequired,
};

ShareModal.defaultProps = {
  resource: null,
  resourceType: 'file',
};

export default ShareModal;
