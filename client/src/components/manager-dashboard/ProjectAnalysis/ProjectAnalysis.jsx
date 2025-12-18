/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';
import { UserRoles } from '../../../constants/Enums';

import styles from './ProjectAnalysis.module.scss';
// eslint-disable-next-line import/no-unresolved
import flashSvg from '../icons/flash.svg?url';

const DEFAULT_SUMMARY = {
  boardsTotal: 0,
  membersTotal: 0,
  releasesTotal: 0,
  doneCardsTotal: 0,
  delayedCardsTotal: 0,
  withoutDatesTotal: 0,
};

const RELEASE_STATUS_LABELS = {
  planned: 'برنامه‌ریزی شده',
  planning: 'در حال برنامه‌ریزی',
  progress: 'در حال انجام',
  inprogress: 'در حال انجام',
  in_progress: 'در حال انجام',
  done: 'انجام شد',
  released: 'منتشر شد',
  archived: 'آرشیو شده',
};

const formatNumber = (value) => {
  const numeric = Number(value || 0);
  if (Number.isNaN(numeric)) {
    return '۰';
  }
  try {
    return numeric.toLocaleString('fa-IR');
  } catch (error) {
    return String(numeric);
  }
};

const formatDate = (value, options = {}) => {
  if (!value) {
    return '—';
  }

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }).format(date);
  } catch (error) {
    return '—';
  }
};

const FlashTag = React.memo(({ label }) => (
  <div className={styles.flashContainer}>
    <img src={flashSvg} alt="" className={styles.flashIcon} />
    <span>{label}</span>
  </div>
));

FlashTag.propTypes = {
  label: PropTypes.string.isRequired,
};

const SectionCard = React.memo(({ title, description, action, children }) => (
  <section className={styles.sectionCard}>
    <div className={styles.sectionHeader}>
      <FlashTag label={title} />
      {action ? <div className={styles.sectionAction}>{action}</div> : null}
    </div>
    {description ? <p className={styles.sectionDescription}>{description}</p> : null}
    <div className={styles.sectionBody}>{children}</div>
  </section>
));

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
  children: PropTypes.node.isRequired,
};

SectionCard.defaultProps = {
  description: null,
  action: null,
};

const SummaryCard = React.memo(({ label, value, tone }) => (
  <article className={styles.summaryCard} data-tone={tone}>
    <span className={styles.summaryValue}>{formatNumber(value)}</span>
    <span className={styles.summaryLabel}>{label}</span>
  </article>
));

SummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tone: PropTypes.oneOf(['default', 'warning', 'danger']),
};

SummaryCard.defaultProps = {
  tone: 'default',
};

const ProgressLegendItem = React.memo(({ tone, label, value }) => (
  <div className={styles.legendItem}>
    <span className={`${styles.legendSwatch} ${styles[`legendSwatch--${tone}`]}`} />
    <span>
      {label}
      <span className={styles.legendValue}> ({formatNumber(value)})</span>
    </span>
  </div>
));

ProgressLegendItem.propTypes = {
  tone: PropTypes.oneOf(['done', 'delayed', 'remaining']).isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
};

const BoardProgressRow = React.memo(({ board }) => (
  <div className={styles.boardRow}>
    <div className={styles.boardInfo}>
      <span className={styles.boardName}>{board.name}</span>
      <span className={styles.boardStats}>
        {formatNumber(board.done)} / {formatNumber(board.total)} کارت
      </span>
    </div>
    <div className={styles.progressTrack}>
      <div
        className={`${styles.progressSegment} ${styles.progressSegmentDone}`}
        style={{ width: `${board.percent.done}%` }}
      />
      <div
        className={`${styles.progressSegment} ${styles.progressSegmentDelayed}`}
        style={{ width: `${board.percent.delayed}%` }}
      />
      <div
        className={`${styles.progressSegment} ${styles.progressSegmentRemaining}`}
        style={{ width: `${board.percent.remaining}%` }}
      />
    </div>
    <div className={styles.boardPercent}>{formatNumber(board.percent.done)}٪</div>
  </div>
));

BoardProgressRow.propTypes = {
  board: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
    done: PropTypes.number.isRequired,
    delayed: PropTypes.number.isRequired,
    remaining: PropTypes.number.isRequired,
    percent: PropTypes.shape({
      done: PropTypes.number.isRequired,
      delayed: PropTypes.number.isRequired,
      remaining: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

const EmptyState = React.memo(({ message }) => (
  <div className={styles.emptyState}>
    <span>{message}</span>
  </div>
));

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
};

const LoadingSpinner = React.memo(() => <span className={styles.loader} aria-hidden="true" />);

const ProjectAnalysis = React.memo(({ selectedProjectId }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectors.selectCurrentUser);

  const selectProjectById = useMemo(() => selectors.makeSelectProjectById(), []);
  const project = useSelector((state) =>
    selectedProjectId ? selectProjectById(state, selectedProjectId) : null,
  );

  const stats = useSelector((state) =>
    selectedProjectId ? selectors.selectProjectStatsByProjectId(state, selectedProjectId) : null,
  );

  const isLoading = useSelector((state) =>
    selectedProjectId ? selectors.selectProjectStatsIsLoading(state, selectedProjectId) : false,
  );

  const error = useSelector((state) =>
    selectedProjectId ? selectors.selectProjectStatsError(state, selectedProjectId) : null,
  );

  const canView = currentUser && [UserRoles.ADMIN, UserRoles.MANAGER].includes(currentUser.role);

  useEffect(() => {
    if (selectedProjectId && canView) {
      dispatch(entryActions.fetchProjectStats(selectedProjectId));
    }
  }, [dispatch, selectedProjectId, canView]);

  const summary = stats?.summary || DEFAULT_SUMMARY;

  const boardCompletion = useMemo(() => {
    if (!stats?.boards) {
      return [];
    }

    return stats.boards
      .map((board) => {
        const total = board.cards.total || 0;
        const done = board.cards.done || 0;
        const delayed = board.cards.delayed || 0;
        const remaining = Math.max(total - done - delayed, 0);

        const normalization = total > 0 ? total : 1;

        return {
          id: String(board.id),
          name: board.name,
          total,
          done,
          delayed,
          remaining,
          percent: {
            done: Math.round((done / normalization) * 100),
            delayed: Math.round((delayed / normalization) * 100),
            remaining: Math.max(
              0,
              100 -
                Math.round((done / normalization) * 100) -
                Math.round((delayed / normalization) * 100),
            ),
          },
        };
      })
      .sort((a, b) => b.percent.done - a.percent.done);
  }, [stats]);

  const cardsDistribution = useMemo(() => {
    if (!stats?.boards) {
      return {
        total: 0,
        done: 0,
        delayed: 0,
        remaining: 0,
        percent: {
          done: 0,
          delayed: 0,
          remaining: 0,
        },
      };
    }

    const totals = stats.boards.reduce(
      (acc, board) => {
        acc.total += board.cards.total || 0;
        acc.done += board.cards.done || 0;
        acc.delayed += board.cards.delayed || 0;
        return acc;
      },
      { total: 0, done: 0, delayed: 0 },
    );

    const remaining = Math.max(totals.total - totals.done - totals.delayed, 0);
    const basis = totals.total > 0 ? totals.total : 1;

    return {
      total: totals.total,
      done: totals.done,
      delayed: totals.delayed,
      remaining,
      percent: {
        done: Math.round((totals.done / basis) * 100),
        delayed: Math.round((totals.delayed / basis) * 100),
        remaining: Math.max(
          0,
          100 -
            Math.round((totals.done / basis) * 100) -
            Math.round((totals.delayed / basis) * 100),
        ),
      },
    };
  }, [stats]);

  const releases = useMemo(() => {
    if (!stats?.boards) {
      return [];
    }

    return stats.boards.flatMap((board) =>
      (board.releases || []).map((release) => ({
        ...release,
        boardId: board.id,
        boardName: board.name,
      })),
    );
  }, [stats]);

  if (!selectedProjectId) {
    return <EmptyState message="لطفاً ابتدا یک پروژه را از لیست انتخاب کنید." />;
  }

  if (!canView) {
    return <EmptyState message="تنها مدیران و ادمین‌ها به این گزارش دسترسی دارند." />;
  }

  if (error) {
    return <EmptyState message={error.message || 'امکان دریافت گزارش وجود ندارد.'} />;
  }

  if (!stats && isLoading) {
    return (
      <div className={styles.loadingState}>
        <LoadingSpinner />
        <span>در حال بارگذاری داده‌های پروژه...</span>
      </div>
    );
  }

  const summaryItems = [
    { label: 'تعداد بردها', value: summary.boardsTotal, tone: 'default' },
    { label: 'اعضای فعال', value: summary.membersTotal, tone: 'default' },
    { label: 'انتشارها', value: summary.releasesTotal, tone: 'default' },
    { label: 'کارت‌های انجام‌شده', value: summary.doneCardsTotal, tone: 'default' },
    { label: 'کارت‌های دیرکرد', value: summary.delayedCardsTotal, tone: 'danger' },
    { label: 'کارت بدون تاریخ', value: summary.withoutDatesTotal, tone: 'warning' },
  ];

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.projectName}>{project?.name || 'پروژه بدون نام'}</h1>
          <p className={styles.projectSubtitle}>نمای کلی عملکرد و سلامت پروژه</p>
        </div>
        <div className={styles.headerMeta}>
          {isLoading ? <LoadingSpinner /> : null}
          <span className={styles.metaItem}>
            <span className={styles.metaCaption}>بردها</span>
            <span className={styles.metaValue}>{formatNumber(summary.boardsTotal)}</span>
          </span>
          <span className={styles.metaDivider} aria-hidden="true" />
          <span className={styles.metaItem}>
            <span className={styles.metaCaption}>اعضا</span>
            <span className={styles.metaValue}>{formatNumber(summary.membersTotal)}</span>
          </span>
        </div>
      </header>

      <SectionCard title="نمای کلی" description="مرور سریع شاخص‌های اصلی پروژه">
        <div className={styles.summaryGrid}>
          {summaryItems.map((item) => (
            <SummaryCard key={item.label} label={item.label} value={item.value} tone={item.tone} />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="پیشرفت بردها"
        description="نسبت کارت‌های انجام‌شده، دیرکرد و در دست انجام برای هر برد"
      >
        {boardCompletion.length === 0 ? (
          <EmptyState message="هنوز بردی برای این پروژه ثبت نشده است." />
        ) : (
          <div className={styles.boardsList}>
            {boardCompletion.map((board) => (
              <BoardProgressRow key={board.id} board={board} />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="نمای کلی کارت‌ها" description="وضعیت کلی کارت‌ها در تمام بردهای پروژه">
        {cardsDistribution.total === 0 ? (
          <EmptyState message="کارت فعالی برای این پروژه وجود ندارد." />
        ) : (
          <div className={styles.distributionCard}>
            <div className={styles.progressTrack}>
              <div
                className={`${styles.progressSegment} ${styles.progressSegmentDone}`}
                style={{ width: `${cardsDistribution.percent.done}%` }}
              />
              <div
                className={`${styles.progressSegment} ${styles.progressSegmentDelayed}`}
                style={{ width: `${cardsDistribution.percent.delayed}%` }}
              />
              <div
                className={`${styles.progressSegment} ${styles.progressSegmentRemaining}`}
                style={{ width: `${cardsDistribution.percent.remaining}%` }}
              />
            </div>
            <div className={styles.legend}>
              <ProgressLegendItem tone="done" label="انجام‌شده" value={cardsDistribution.done} />
              <ProgressLegendItem tone="delayed" label="دیرکرد" value={cardsDistribution.delayed} />
              <ProgressLegendItem
                tone="remaining"
                label="در جریان"
                value={cardsDistribution.remaining}
              />
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="وضعیت بردها" description="جزئیات کارت‌ها و انتشارها در هر برد">
        {(stats?.boards || []).length === 0 ? (
          <EmptyState message="بردی برای نمایش وجود ندارد." />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>عنوان برد</th>
                  <th>کارت‌ها</th>
                  <th>انجام‌شده</th>
                  <th>دیرکرد</th>
                  <th>بدون آغاز</th>
                  <th>بدون پایان</th>
                  <th>بدون تاریخ</th>
                  <th>انتشارها</th>
                </tr>
              </thead>
              <tbody>
                {stats.boards.map((board) => (
                  <tr key={board.id}>
                    <td>
                      <div className={styles.tableBoardCell}>
                        <span className={styles.tableBoardName}>{board.name}</span>
                        <span className={styles.tableBoardHint}>
                          {formatNumber(board.cards.done)} / {formatNumber(board.cards.total)}{' '}
                          انجام‌شده
                        </span>
                      </div>
                    </td>
                    <td>{formatNumber(board.cards.total)}</td>
                    <td>{formatNumber(board.cards.done)}</td>
                    <td data-negative={board.cards.delayed > 0}>
                      {formatNumber(board.cards.delayed)}
                    </td>
                    <td>{formatNumber(board.cards.withoutStartDate)}</td>
                    <td>{formatNumber(board.cards.withoutDueDate)}</td>
                    <td>{formatNumber(board.cards.withoutDates)}</td>
                    <td>{formatNumber(board.releasesTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="انتشارها" description="جدول زمان‌بندی و وضعیت انتشارها">
        {releases.length === 0 ? (
          <EmptyState message="انتشاری برای این پروژه ثبت نشده است." />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>برد</th>
                  <th>نسخه</th>
                  <th>وضعیت</th>
                  <th>آغاز</th>
                  <th>پایان</th>
                  <th>انتشار</th>
                </tr>
              </thead>
              <tbody>
                {releases.map((release) => (
                  <tr key={release.id}>
                    <td>
                      <div className={styles.tableBoardCell}>
                        <span className={styles.tableBoardName}>{release.boardName}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.releaseVersion}>
                        <span className={styles.releaseBadge}>{release.version || '—'}</span>
                        <span>{release.name || 'بدون عنوان'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.statusPill}>
                        {RELEASE_STATUS_LABELS[release.status] || release.status || '—'}
                      </span>
                    </td>
                    <td>{formatDate(release.startDate)}</td>
                    <td>{formatDate(release.endDate)}</td>
                    <td>
                      {formatDate(release.releasedAt, { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
});

ProjectAnalysis.propTypes = {
  selectedProjectId: PropTypes.string,
};

ProjectAnalysis.defaultProps = {
  selectedProjectId: null,
};

export default ProjectAnalysis;
