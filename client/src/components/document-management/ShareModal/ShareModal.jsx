/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox, Icon, Modal } from 'semantic-ui-react';
import { Input } from '../../../lib/custom-ui';

import styles from './ShareModal.module.scss';

const ShareModal = React.memo(({ file, isOpen, onClose, onCreateShareLink }) => {
  const [linkEnabled, setLinkEnabled] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileToShare] = useState(file);

  useEffect(() => {
    if (!isOpen) {
      setLinkEnabled(false);
      setShareLink('');
      setCopied(false);
    }
  }, [isOpen]);

  const handleToggleLink = async (enabled) => {
    setLinkEnabled(enabled);

    if (enabled && !shareLink) {
      setIsCreating(true);
      try {
        const linkData = {
          resourceType: 'file',
          resourceId: fileToShare?.id,
          isDownloadable: true,
        };

        const result = await onCreateShareLink(linkData);

        if (result && result.token) {
          const generatedLink = `${window.location.origin}/public/${result.token}`;
          setShareLink(generatedLink);
        } else {
          const generatedLink = `${window.location.origin}/share/${Math.random().toString(36).substring(7)}`;
          setShareLink(generatedLink);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to create share link:', error);
        setLinkEnabled(false);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal open={isOpen} closeIcon size="tiny" onClose={onClose}>
      <Modal.Header>Share link</Modal.Header>
      <Modal.Content>
        <div className={styles.toggleSection}>
          <Checkbox
            toggle
            label="Create Shareable link"
            checked={linkEnabled}
            onChange={(e, { checked }) => handleToggleLink(checked)}
            disabled={isCreating}
          />
        </div>

        <div className={styles.linkSection}>
          <div className={styles.linkInputWrapper}>
            <Input
              value={shareLink || ''}
              placeholder={
                linkEnabled && !shareLink ? 'Generating link...' : 'https://planka.app/share/link'
              }
              readOnly
              disabled={!linkEnabled || !shareLink}
              fluid
            />
            <Button
              positive={copied}
              icon={copied ? 'check' : 'copy'}
              content={copied ? 'Copied!' : 'Copy'}
              onClick={handleCopyLink}
              disabled={!shareLink}
              style={{ marginLeft: '8px' }}
            />
          </div>
        </div>

        {isCreating && (
          <div style={{ marginTop: '10px', color: '#666' }}>
            <Icon loading name="spinner" /> Creating share link...
          </div>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button content="Close" onClick={onClose} />
      </Modal.Actions>
    </Modal>
  );
});

ShareModal.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreateShareLink: PropTypes.func.isRequired,
};

ShareModal.defaultProps = {
  file: null,
};

export default ShareModal;
