/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
// eslint-disable-next-line import/no-unresolved
import flashSvg from '../icons/flash-gray.svg?url';

import entryActions from '../../../entry-actions';
import selectors, { selectProjectHistoriesByProjectId } from '../../../selectors';

import styles from './ProjectHistory.module.scss';

const DEFAULT_SECTION_TITLE = 'تاریخچه پروژه';
const EMPTY_STATE_NO_PROJECT = 'برای مشاهده تاریخچه، یک پروژه را انتخاب کنید.';
const EMPTY_STATE_NO_DATA = 'تاکنون تاریخچه‌ای برای این پروژه ثبت نشده است.';
const EMPTY_CONTENT_FALLBACK = 'بدون توضیح';
const UNKNOWN_USER_LABEL = 'کاربر ناشناس';
const UNKNOWN_DATE_LABEL = 'تاریخ نامشخص';

const FlashTag = React.memo(({ label }) => (
  <div className={styles.flashContainer}>
    <img src={flashSvg} alt="" className={styles.flashIcon} />
    <span>{label}</span>
  </div>
));

FlashTag.propTypes = {
  label: PropTypes.string.isRequired,
};

const SectionCard = React.memo(({ title, action, children }) => (
  <section className={styles.sectionCard}>
    <div className={styles.sectionHeader}>
      <FlashTag label={title} />
      {action ? <div className={styles.sectionAction}>{action}</div> : null}
    </div>
    <div className={styles.sectionBody}>{children}</div>
  </section>
));

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  action: PropTypes.node,
  children: PropTypes.node.isRequired,
};

SectionCard.defaultProps = {
  action: null,
};

const formatHistoryDate = (value) => {
  if (!value) {
    return UNKNOWN_DATE_LABEL;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return UNKNOWN_DATE_LABEL;
  }

  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    return date.toISOString().slice(0, 16).replace('T', ' ');
  }
};

const formatMonthLabel = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
    }).format(date);
  } catch (error) {
    return null;
  }
};

const getUserDisplayName = (user) =>
  user?.name || user?.username || user?.email || UNKNOWN_USER_LABEL;

const HistoryItem = React.memo(({ item }) => (
  <article className={styles.historyItem}>
    <div className={styles.historyHeader}>
      <span className={styles.historyUser}>{item.userLabel}</span>
      <span className={styles.historyDate}>{item.dateLabel}</span>
    </div>
    <p className={styles.historyContent}>{item.content}</p>
  </article>
));

HistoryItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    userLabel: PropTypes.string.isRequired,
    dateLabel: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
};

const ProjectHistory = React.memo(({ selectedProjectId }) => {
  const dispatch = useDispatch();

  const histories = useSelector((state) =>
    selectProjectHistoriesByProjectId(state, selectedProjectId),
  );
  const users = useSelector(selectors.selectAllActiveUsers);

  useEffect(() => {
    if (!selectedProjectId) {
      return;
    }

    // Fetch latest project histories whenever the selected project changes.
    dispatch(entryActions.fetchProjectHistories(selectedProjectId, null));
  }, [dispatch, selectedProjectId]);

  const usersById = useMemo(() => {
    const map = new Map();
    (users || []).forEach((user) => {
      if (user?.id) {
        map.set(user.id, user);
      }
    });
    return map;
  }, [users]);

  const normalizedHistories = useMemo(() => {
    if (!histories || histories.length === 0) {
      return [];
    }

    return histories.map((history) => {
      const createdAt = history.createdAt || history.updatedAt || null;
      const user = history.createdByUserId ? usersById.get(history.createdByUserId) : null;
      const rawContent = typeof history.text === 'string' ? history.text : '';
      const content = rawContent.trim().length > 0 ? rawContent : EMPTY_CONTENT_FALLBACK;

      return {
        id: String(history.id),
        userLabel: getUserDisplayName(user),
        dateLabel: formatHistoryDate(createdAt),
        content,
        createdAt,
      };
    });
  }, [histories, usersById]);

  const sectionTitle = useMemo(() => {
    if (!selectedProjectId || normalizedHistories.length === 0) {
      return DEFAULT_SECTION_TITLE;
    }

    return formatMonthLabel(normalizedHistories[0].createdAt) || DEFAULT_SECTION_TITLE;
  }, [normalizedHistories, selectedProjectId]);

  let sectionBody = null;

  if (!selectedProjectId) {
    sectionBody = <div className={styles.emptyState}>{EMPTY_STATE_NO_PROJECT}</div>;
  } else if (normalizedHistories.length === 0) {
    sectionBody = <div className={styles.emptyState}>{EMPTY_STATE_NO_DATA}</div>;
  } else {
    sectionBody = (
      <div className={styles.historyList}>
        {normalizedHistories.map((item) => (
          <HistoryItem key={item.id} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <SectionCard title={sectionTitle}>{sectionBody}</SectionCard>
    </div>
  );
});

ProjectHistory.propTypes = {
  selectedProjectId: PropTypes.string,
};

ProjectHistory.defaultProps = {
  selectedProjectId: null,
};

export default ProjectHistory;
