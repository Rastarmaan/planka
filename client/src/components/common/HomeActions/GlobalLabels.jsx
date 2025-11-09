/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import { UserRoles } from '../../../constants/Enums';
import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';
import GlobalLabelsModal from '../Home/GlobalLabelsModal';

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
      <button type="button" className={classNames(styles.button)} onClick={handleOpenModal}>
        <Icon fitted name="tags" />
        <span className={styles.text}>{t('common.globalLabels', { context: 'title' })}</span>
      </button>

      {isModalOpen && <GlobalLabelsModal onClose={handleCloseModal} />}
    </>
  );
});

export default GlobalLabels;
