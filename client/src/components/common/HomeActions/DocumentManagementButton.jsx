/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import classNames from 'classnames';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';

import Paths from '../../../constants/Paths';

import styles from './DocumentManagementButton.module.scss';

const DocumentManagementButton = React.memo(() => {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(Paths.DOCUMENT_MANAGEMENT);
  }, [navigate]);

  return (
    <button type="button" className={classNames(styles.button)} onClick={handleClick}>
      <Icon fitted name="file alternate outline" />
      <span className={styles.text}>{t('common.documentManagement', { context: 'title' })}</span>
    </button>
  );
});

export default DocumentManagementButton;
