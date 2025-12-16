/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Tab } from 'semantic-ui-react';

import { UserRoles } from '../../../constants/Enums';
import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';
import { useClosableModal } from '../../../hooks';
import BoardTemplatesPane from './BoardTemplatesPane';
import GlobalLabelsPane from './GlobalLabelsPane';
import ReportsPane from './ReportsPane';
import ProjectProfilesPane from './ProjectProfilesPane';
import FilledProjectProfilesPane from './FilledProjectProfilesPane';
import TeamsPane from './TeamsPane';
import UsersPane from './UsersPane';
import WebhooksPane from './WebhooksPane';

import styles from './AdministrationModal.module.scss';

const AdministrationModal = React.memo(() => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const currentUser = useSelector(selectors.selectCurrentUser);
  const isAdmin = currentUser?.role === UserRoles.ADMIN;
  const isManager = currentUser?.role === UserRoles.MANAGER;
  const isAdminOrManager = isAdmin || isManager;
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleClose = useCallback(() => {
    dispatch(entryActions.closeModal());
  }, [dispatch]);

  const handleTabChange = useCallback((_, { activeIndex }) => {
    setActiveTabIndex(activeIndex);
  }, []);

  const [ClosableModal] = useClosableModal();

  const panes = [
    {
      menuItem: t('common.users', {
        context: 'title',
      }),
      render: () => <UsersPane />,
    },
    ...(isAdmin
      ? [
          {
            menuItem: t('common.teams', {
              context: 'title',
            }),
            render: () => <TeamsPane />,
          },
          {
            menuItem: t('common.boardTemplates', {
              context: 'title',
            }),
            render: () => <BoardTemplatesPane />,
          },
        ]
      : []),
    ...(isAdminOrManager
      ? [
          {
            menuItem: t('common.reports', {
              context: 'title',
            }),
            render: () => <ReportsPane />,
          },
          {
            menuItem: t('common.profileTemplates'),
            render: () => <ProjectProfilesPane />,
          },
          {
            menuItem: t('common.projectProfiles'),
            render: () => <FilledProjectProfilesPane />,
          },
        ]
      : []),
    {
      menuItem: t('common.webhooks', {
        context: 'title',
      }),
      render: () => <WebhooksPane />,
    },
    {
      menuItem: t('common.globalLabels', {
        context: 'title',
      }),
      render: () => <GlobalLabelsPane />,
    },
  ];

  const isUsersPaneActive = activeTabIndex === 0;

  let reportsPaneIndex = -1;
  let profileTemplatesPaneIndex = -1;
  let projectProfilesPaneIndex = -1;
  if (isAdmin) {
    reportsPaneIndex = 3;
    profileTemplatesPaneIndex = 4;
    projectProfilesPaneIndex = 5;
  } else if (isAdminOrManager) {
    reportsPaneIndex = 1;
    profileTemplatesPaneIndex = 2;
    projectProfilesPaneIndex = 3;
  }
  const isReportsPaneActive = activeTabIndex === reportsPaneIndex;
  const isProfileTemplatesPaneActive = activeTabIndex === profileTemplatesPaneIndex;
  const isProjectProfilesPaneActive = activeTabIndex === projectProfilesPaneIndex;

  const isLargeModal =
    isUsersPaneActive ||
    isReportsPaneActive ||
    isProfileTemplatesPaneActive ||
    isProjectProfilesPaneActive;

  return (
    <ClosableModal
      closeIcon
      size={isLargeModal ? 'large' : 'small'}
      centered={false}
      className={classNames(isUsersPaneActive && styles.wrapperUsers)}
      onClose={handleClose}
    >
      <Modal.Content>
        <Tab
          menu={{
            secondary: true,
            pointing: true,
          }}
          panes={panes}
          onTabChange={handleTabChange}
        />
      </Modal.Content>
    </ClosableModal>
  );
});

export default AdministrationModal;
