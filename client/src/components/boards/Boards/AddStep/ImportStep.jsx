/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { FilePicker, Popup } from '../../../../lib/custom-ui';

import styles from './ImportStep.module.scss';

const ImportStep = React.memo(({ onSelect, onBack, onImportFromPlanka, onSelectFromTemplate }) => {
  const [t] = useTranslation();

  const handleFileSelect = useCallback(
    (type, file) => {
      onSelect({
        type,
        file,
      });

      onBack();
    },
    [onSelect, onBack],
  );

  const handlePlankaImport = useCallback(() => {
    onImportFromPlanka();
  }, [onImportFromPlanka]);

  const handleTemplateSelect = useCallback(() => {
    onSelectFromTemplate();
  }, [onSelectFromTemplate]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.importBoard', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Button
          fluid
          content={t('common.fromTemplate')}
          icon="clone"
          className={styles.button}
          onClick={handleTemplateSelect}
        />
        <Button
          fluid
          content={t('common.fromPlankaBoard')}
          icon="linkify"
          className={styles.button}
          onClick={handlePlankaImport}
        />
        <FilePicker accept=".json" onSelect={(file) => handleFileSelect('trello', file)}>
          <Button fluid content={t('common.fromTrello')} icon="trello" className={styles.button} />
        </FilePicker>
      </Popup.Content>
    </>
  );
});

ImportStep.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onImportFromPlanka: PropTypes.func.isRequired,
  onSelectFromTemplate: PropTypes.func.isRequired,
};

export default ImportStep;
