/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Tab } from 'semantic-ui-react';

import entryActions from '../../../entry-actions';
import { useClosableModal } from '../../../hooks';
import selectors from '../../../selectors';
import GeneralPane from './GeneralPane';
import NotificationsPane from './NotificationsPane';
import PreferencesPane from './PreferencesPane';
import SyncPane from './SyncPane';
import TeamsPane from './TeamsPane';

const BoardSettingsModal = React.memo(() => {
  const openPreferences = useSelector(
    (state) => selectors.selectCurrentModal(state).params.openPreferences,
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleClose = useCallback(() => {
    dispatch(entryActions.closeModal());
  }, [dispatch]);

  const [ClosableModal] = useClosableModal();

  const panes = [
    {
      menuItem: t('common.general', {
        context: 'title',
      }),
      render: () => <GeneralPane />,
    },
    {
      menuItem: t('common.preferences', {
        context: 'title',
      }),
      render: () => <PreferencesPane />,
    },
    {
      menuItem: t('common.teams', {
        context: 'title',
      }),
      render: () => <TeamsPane />,
    },
    {
      menuItem: t('common.sync', {
        context: 'title',
      }),
      render: () => <SyncPane />,
    },
    {
      menuItem: t('common.notifications', {
        context: 'title',
      }),
      render: () => <NotificationsPane />,
    },
  ];

  return (
    <ClosableModal closeIcon size="small" centered={false} onClose={handleClose}>
      <ClosableModal.Content>
        <Tab
          menu={{
            secondary: true,
            pointing: true,
          }}
          panes={panes}
          defaultActiveIndex={openPreferences ? 1 : undefined}
        />
      </ClosableModal.Content>
    </ClosableModal>
  );
});

export default BoardSettingsModal;
