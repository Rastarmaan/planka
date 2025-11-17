/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, Radio, Tab } from 'semantic-ui-react';

import entryActions from '../../../entry-actions';
import { usePopupInClosableContext } from '../../../hooks';
import selectors from '../../../selectors';
import ConfirmationStep from '../../common/ConfirmationStep';

import styles from './PreferencesPane.module.scss';

const GoogleCalendarPane = React.memo(() => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const hasFetchedRef = useRef(false);

  const status = useSelector((state) => selectors.selectGoogleCalendarStatus(state));
  const calendars = useSelector((state) => state.googleCalendar?.calendars || null);
  const isFetching = useSelector((state) => state.googleCalendar?.isFetching || false);
  const isFetchingCalendars = useSelector(
    (state) => state.googleCalendar?.isFetchingCalendars || false,
  );

  const ConfirmationPopup = usePopupInClosableContext(ConfirmationStep);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('googleCalendarConnected') === 'true') {
      const newUrl = `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState({}, '', newUrl);

      dispatch(entryActions.googleCalendar.fetchStatus());

      // eslint-disable-next-line no-alert
      alert(
        t('common.googleCalendarConnectedSuccess', {
          defaultValue: 'Google Calendar connected successfully!',
        }),
      );
    } else if (params.get('googleCalendarError')) {
      const errorMsg = params.get('googleCalendarError');
      const newUrl = `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState({}, '', newUrl);

      // eslint-disable-next-line no-alert
      alert(
        t('common.googleCalendarConnectionError', {
          defaultValue: `Error connecting to Google Calendar: ${errorMsg}`,
        }),
      );
    }
  }, [dispatch, t]);

  useEffect(() => {
    if (!hasFetchedRef.current && status === null && !isFetching) {
      hasFetchedRef.current = true;
      dispatch(entryActions.googleCalendar.fetchStatus());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status?.isConnected && status?.isEnabled && !calendars && !isFetchingCalendars) {
      dispatch(entryActions.googleCalendar.fetchCalendars());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.isConnected, status?.isEnabled]);

  const handleAuthorize = useCallback(() => {
    entryActions.googleCalendar.authorize();
  }, []);

  const handleDisconnect = useCallback(() => {
    dispatch(entryActions.googleCalendar.disconnect());
  }, [dispatch]);

  const handleToggle = useCallback(
    (_, { checked }) => {
      dispatch(entryActions.googleCalendar.toggle(checked));
    },
    [dispatch],
  );

  const handleCalendarChange = useCallback(
    (_, { value }) => {
      dispatch(entryActions.googleCalendar.updateCalendar(value));
    },
    [dispatch],
  );

  const isConnected = status?.isConnected || false;
  const isEnabled = status?.isEnabled || false;
  const currentCalendarId = status?.calendarId || 'primary';

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <h3>{t('common.googleCalendar', { context: 'title' })}</h3>
      <p style={{ marginBottom: '1rem' }}>{t('common.googleCalendarDescription')}</p>

      {!isConnected ? (
        <Button primary onClick={handleAuthorize}>
          {t('common.connectGoogleCalendar')}
        </Button>
      ) : (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <strong>{t('common.status')}:</strong>{' '}
            {t('common.connected', { context: 'googleCalendar' })}
          </div>

          <Radio
            toggle
            checked={isEnabled}
            label={t('common.enableGoogleCalendarSync')}
            className={styles.radio}
            onChange={handleToggle}
          />

          {isEnabled && calendars && calendars.length > 0 && (
            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                <strong>{t('common.selectCalendar', { defaultValue: 'Select Calendar' })}:</strong>
              </label>
              <Dropdown
                selection
                options={calendars.map((cal) => ({
                  key: cal.id,
                  value: cal.id,
                  text: `${cal.summary}${cal.primary ? ' (Primary)' : ''}`,
                }))}
                value={currentCalendarId}
                onChange={handleCalendarChange}
                loading={isFetchingCalendars}
                style={{ minWidth: '250px' }}
              />
              {calendars.find((cal) => cal.id === currentCalendarId)?.description && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.9em', color: '#666' }}>
                  {calendars.find((cal) => cal.id === currentCalendarId).description}
                </p>
              )}
            </div>
          )}

          <ConfirmationPopup
            title="common.disconnectGoogleCalendar"
            content="common.areYouSureYouWantToDisconnectGoogleCalendar"
            buttonContent="action.disconnect"
            onConfirm={handleDisconnect}
          >
            <Button negative style={{ marginTop: '1rem' }}>
              {t('common.disconnectGoogleCalendar')}
            </Button>
          </ConfirmationPopup>
        </>
      )}
    </Tab.Pane>
  );
});

export default GoogleCalendarPane;
