/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Modal, Form } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import { Input } from '../../../lib/custom-ui';

import styles from './LinkSettingsModal.module.scss';

const LinkSettingsModal = React.memo(({ isOpen, onClose, onSave, currentSettings }) => {
  const [t] = useTranslation();
  const [expirationEnabled, setExpirationEnabled] = useState(!!currentSettings?.expiresAt);
  const [expiresAt, setExpiresAt] = useState(
    currentSettings?.expiresAt ? new Date(currentSettings.expiresAt) : null,
  );
  const [dateStr, setDateStr] = useState(expiresAt ? expiresAt.toLocaleDateString() : '');
  const [timeStr, setTimeStr] = useState(
    expiresAt ? expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
  );
  const [passwordEnabled, setPasswordEnabled] = useState(!!currentSettings?.password);
  const [password, setPassword] = useState('');

  const handleSave = () => {
    const settings = {
      isDownloadable: true,
    };

    if (expirationEnabled && expiresAt) {
      settings.expiresAt = expiresAt.toISOString();
    } else {
      settings.expiresAt = null;
    }

    if (passwordEnabled && password.trim()) {
      settings.password = password.trim();
    } else if (!passwordEnabled) {
      settings.password = null;
    }

    onSave(settings);
  };

  return (
    <Modal open={isOpen} closeIcon size="tiny" onClose={onClose} className={styles.modal}>
      <Modal.Header>{t('documentManagement.shareableLinkSettings')}</Modal.Header>
      <Modal.Content>
        <Form>
          <div className={styles.settingSection}>
            <div className={styles.settingHeader}>
              <Checkbox
                toggle
                checked={expirationEnabled}
                onChange={(e, { checked }) => setExpirationEnabled(checked)}
              />
              <span className={styles.settingLabel}>{t('documentManagement.linkExpiration')}</span>
            </div>
            {expirationEnabled && (
              <div className={styles.settingContent}>
                <span className={styles.settingDescription}>
                  {t('documentManagement.linkValidUntil')}
                </span>

                <div style={{ display: 'flex', gap: '12px', marginBottom: 12 }}>
                  <Input
                    placeholder={t('documentManagement.selectDate')}
                    value={dateStr}
                    readOnly
                    onClick={() => {}}
                    style={{ width: '50%' }}
                  />
                  <Input
                    placeholder={t('documentManagement.selectTime')}
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    style={{ width: '50%' }}
                  />
                </div>

                <DatePicker
                  inline
                  selected={expiresAt}
                  onChange={(date) => {
                    setExpiresAt(date);
                    setDateStr(date ? date.toLocaleDateString() : '');
                    setTimeStr(
                      date
                        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '',
                    );
                  }}
                  minDate={new Date()}
                />
              </div>
            )}
          </div>

          <div className={styles.divider} />

          <div className={styles.settingSection}>
            <div className={styles.settingHeader}>
              <Checkbox
                toggle
                checked={passwordEnabled}
                onChange={(e, { checked }) => setPasswordEnabled(checked)}
              />
              <span className={styles.settingLabel}>{t('documentManagement.passwordProtect')}</span>
            </div>
            {passwordEnabled && (
              <div className={styles.settingContent}>
                <span className={styles.settingDescription}>
                  {t('documentManagement.passwordProtectDescription')}
                </span>
                <Input
                  type="password"
                  placeholder={t('documentManagement.enterNewPassword')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fluid
                />
                <span className={styles.helperText}>
                  {t('documentManagement.passwordNotRequestedOwner')}
                </span>
              </div>
            )}
          </div>
        </Form>
      </Modal.Content>
      <Modal.Actions className={styles.actions}>
        <Button content={t('action.cancel')} onClick={onClose} />
        <Button content={t('action.save')} positive onClick={handleSave} />
      </Modal.Actions>
    </Modal>
  );
});

LinkSettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  currentSettings: PropTypes.shape({
    expiresAt: PropTypes.string,
    password: PropTypes.string,
    isDownloadable: PropTypes.bool,
  }),
};

LinkSettingsModal.defaultProps = {
  currentSettings: {},
};

export default LinkSettingsModal;
