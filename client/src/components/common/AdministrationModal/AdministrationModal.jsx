/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Modal, Tab } from 'semantic-ui-react';

import entryActions from '../../../entry-actions';
import { useClosableModal } from '../../../hooks';
import GlobalLabelsPane from './GlobalLabelsPane';
import UsersPane from './UsersPane';
import WebhooksPane from './WebhooksPane';

import styles from './AdministrationModal.module.scss';

const AdministrationModal = React.memo(() => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
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

  return (
    <ClosableModal
      closeIcon
      size={isUsersPaneActive ? 'large' : 'small'}
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
