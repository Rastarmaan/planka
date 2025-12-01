/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Icon, Loader, Message, Table } from 'semantic-ui-react';
import { Popup } from '../../../../lib/custom-ui';

import api from '../../../../api';
import selectors from '../../../../selectors';

import styles from './TemplateSelectModal.module.scss';

const TemplateSelectModal = React.memo(({ onSelect, onBack }) => {
  const [t] = useTranslation();
  const accessToken = useSelector(selectors.selectAccessToken);

  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const data = await api.getBoardTemplates(headers);
      setTemplates(data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleTemplateClick = useCallback(
    (template) => {
      onSelect(template);
    },
    [onSelect],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.selectTemplate')}</Popup.Header>
      <Popup.Content>
        {isLoading && (
          <div className={styles.loaderContainer}>
            <Loader active inline="centered" />
          </div>
        )}

        {!isLoading && error && (
          <Message negative>
            <Message.Header>{t('common.error')}</Message.Header>
            <p>{error}</p>
          </Message>
        )}

        {!isLoading && !error && templates.length === 0 && (
          <Message info>
            <p>{t('common.noTemplatesAvailable')}</p>
          </Message>
        )}

        {!isLoading && !error && templates.length > 0 && (
          <Table basic selectable className={styles.table}>
            <Table.Body>
              {templates.map((template) => (
                <Table.Row
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className={styles.templateRow}
                >
                  <Table.Cell>
                    <div className={styles.templateName}>
                      <Icon name="clone" />
                      {template.name}
                    </div>
                    {template.description && (
                      <div className={styles.templateDescription}>{template.description}</div>
                    )}
                  </Table.Cell>
                  <Table.Cell textAlign="right" width={2}>
                    {template.isListsLocked && <Icon name="lock" title={t('common.listsLocked')} />}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}

        {!isLoading && !error && templates.length > 0 && (
          <div className={styles.footer}>
            <Button onClick={onBack}>{t('action.cancel')}</Button>
          </div>
        )}
      </Popup.Content>
    </>
  );
});

TemplateSelectModal.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default TemplateSelectModal;
