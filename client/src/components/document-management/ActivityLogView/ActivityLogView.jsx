/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useState } from 'react';
import { Pagination, Loader, Icon, Button } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { format, formatDistance } from 'date-fns';

import actions from '../../../actions';
import UserAvatar from '../../users/UserAvatar';
import styles from './ActivityLogView.module.scss';

const ActivityLogView = React.memo(() => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const { items, total, isFetching } = useSelector((state) => state.documentActivities);
  const [page, setPage] = useState(1);
  const [dateFormat, setDateFormat] = useState('relative'); // 'relative' or 'absolute'
  const limit = 20;

  useEffect(() => {
    dispatch(
      actions.fetchDocumentActivities({
        limit,
        skip: (page - 1) * limit,
        excludeActions: ['download'],
      }),
    );
  }, [dispatch, page]);

  const handlePageChange = (e, { activePage }) => {
    setPage(activePage);
  };

  const toggleDateFormat = () => {
    setDateFormat((prev) => (prev === 'relative' ? 'absolute' : 'relative'));
  };

  const formatDate = (date) => {
    const dateObj = new Date(date);
    if (dateFormat === 'relative') {
      return formatDistance(dateObj, new Date(), { addSuffix: true });
    }
    return format(dateObj, 'MMM dd, yyyy HH:mm');
  };

  const getActionIcon = (action) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return 'plus';
      case 'update':
      case 'updated':
      case 'edit':
      case 'edited':
        return 'edit';
      case 'delete':
      case 'deleted':
        return 'trash';
      case 'share':
      case 'shared':
        return 'share';
      case 'download':
      case 'downloaded':
        return 'download';
      case 'view':
      case 'viewed':
        return 'eye';
      case 'upload':
      case 'uploaded':
        return 'upload';
      default:
        return 'circle';
    }
  };

  const getActionColor = (action) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
      case 'upload':
      case 'uploaded':
        return '#00b74a';
      case 'update':
      case 'updated':
      case 'edit':
      case 'edited':
        return '#ffab00';
      case 'delete':
      case 'deleted':
        return '#ff5630';
      case 'share':
      case 'shared':
        return '#0052cc';
      case 'download':
      case 'downloaded':
      case 'view':
      case 'viewed':
        return '#6b778c';
      default:
        return 'rgba(255, 255, 255, 0.7)';
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Icon name="history" className={styles.headerIcon} />
          <div>
            <h2 className={styles.title}>{t('documentActivity.title', 'Activity Log')}</h2>
            <p className={styles.subtitle}>
              {t('documentActivity.subtitle', 'Track all document activities and changes')}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button
            basic
            onClick={toggleDateFormat}
            className={styles.toggleButton}
            icon={dateFormat === 'relative' ? 'calendar' : 'clock'}
            content={dateFormat === 'relative' ? 'Show dates' : 'Show relative'}
          />
        </div>
      </div>

      <div className={styles.content}>
        {(() => {
          if (isFetching && items.length === 0) {
            return (
              <div className={styles.loadingContainer}>
                <Loader active size="medium" className={styles.loader} />
                <p className={styles.loadingText}>
                  {t('common.loading', 'Loading activity history...')}
                </p>
              </div>
            );
          }

          if (items.length === 0 && !isFetching) {
            return (
              <div className={styles.emptyState}>
                <Icon name="history" className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>
                  {t('documentActivity.noActivity', 'No activity yet')}
                </h3>
                <p className={styles.emptyDescription}>
                  {t(
                    'documentActivity.noActivityDescription',
                    'Document activities will appear here once you start working with files.',
                  )}
                </p>
              </div>
            );
          }

          return (
            <>
              <div className={styles.tableContainer}>
                <div className={styles.activityList}>
                  {items.map((activity) => (
                    <div key={activity.id} className={styles.activityItem}>
                      <div
                        className={styles.activityIcon}
                        style={{ color: getActionColor(activity.action) }}
                      >
                        <Icon name={getActionIcon(activity.action)} />
                      </div>
                      <div className={styles.activityContent}>
                        <div className={styles.activityHeader}>
                          <div className={styles.userInfo}>
                            {activity.user ? (
                              <>
                                <UserAvatar
                                  id={activity.user.id}
                                  size="small"
                                  className={styles.userAvatar}
                                />
                                <span className={styles.userName}>{activity.user.name}</span>
                              </>
                            ) : (
                              <span className={styles.unknownUser}>
                                <Icon name="user" />
                                {t('common.unknown', 'Unknown user')}
                              </span>
                            )}
                          </div>
                          <div className={styles.activityTime}>
                            {formatDate(activity.createdAt)}
                          </div>
                        </div>
                        <div className={styles.activityDetails}>
                          <span className={styles.action}>{activity.action}</span>
                          <span className={styles.resource}>
                            {activity.resourceType}: <strong>{activity.resourceName}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {total > limit && (
                <div className={styles.pagination}>
                  <Pagination
                    activePage={page}
                    totalPages={Math.ceil(total / limit)}
                    onPageChange={handlePageChange}
                    size="mini"
                    className={styles.paginationComponent}
                  />
                  <div className={styles.paginationInfo}>
                    {t(
                      'common.showingResults',
                      'Showing {{start}}-{{end}} of {{total}} activities',
                      {
                        start: (page - 1) * limit + 1,
                        end: Math.min(page * limit, total),
                        total,
                      },
                    )}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
});

export default ActivityLogView;
