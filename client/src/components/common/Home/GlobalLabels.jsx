/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react';

import { UserRoles } from '../../../constants/Enums';
import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';
import GlobalLabelsModal from './GlobalLabelsModal';

import styles from './GlobalLabels.module.scss';

const GlobalLabels = React.memo(() => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const globalLabels = useSelector(selectors.selectGlobalLabels);
  const currentUser = useSelector(selectors.selectCurrentUser);
  const isAdmin = currentUser && currentUser.role === UserRoles.ADMIN;

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(entryActions.getGlobalLabels());
  }, [dispatch]);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  if (!isAdmin && globalLabels.length === 0) {
    return null;
  }

  return (
    <>
      <div className={styles.wrapper}>
        <Button primary size="large" className={styles.manageButton} onClick={handleOpenModal}>
          <Icon name="tags" />
          {t('common.globalLabels', { context: 'title' })}
          {globalLabels.length > 0 && <span className={styles.badge}>{globalLabels.length}</span>}
        </Button>
      </div>

      {isModalOpen && <GlobalLabelsModal onClose={handleCloseModal} />}
    </>
  );
});

export default GlobalLabels;
