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
import ProjectCategoriesModal from '../Home/ProjectCategoriesModal';

import styles from './ProjectCategories.module.scss';

const ProjectCategories = React.memo(() => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const projectCategories = useSelector(selectors.selectProjectCategoriesOrderedByName);
  const currentUser = useSelector(selectors.selectCurrentUser);
  const isAdmin = currentUser && currentUser.role === UserRoles.ADMIN;

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(entryActions.getProjectCategories());
  }, [dispatch]);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  if (!isAdmin && projectCategories.length === 0) {
    return null;
  }

  return (
    <>
      <button type="button" className={classNames(styles.button)} onClick={handleOpenModal}>
        <Icon fitted name="folder" />
        <span className={styles.text}>{t('common.projectCategories', { context: 'title' })}</span>
      </button>

      {isModalOpen && <ProjectCategoriesModal onClose={handleCloseModal} />}
    </>
  );
});

export default ProjectCategories;
