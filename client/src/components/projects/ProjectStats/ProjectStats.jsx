/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Icon,
  Loader,
  Message,
  Segment,
  Statistic,
  Table,
  Progress,
  Label,
} from 'semantic-ui-react';

import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';
import { UserRoles } from '../../../constants/Enums';

import styles from './ProjectStats.module.scss';

const ProjectStats = React.memo(() => {
  const dispatch = useDispatch();
  const { projectId } = useSelector(selectors.selectPath);
  const project = useSelector(selectors.selectCurrentProject);
  const currentUser = useSelector(selectors.selectCurrentUser);

  const stats = useSelector((state) => selectors.selectProjectStatsByProjectId(state, projectId));
  const isLoading = useSelector((state) => selectors.selectProjectStatsIsLoading(state, projectId));
  const error = useSelector((state) => selectors.selectProjectStatsError(state, projectId));

  const canView = currentUser && [UserRoles.ADMIN, UserRoles.MANAGER].includes(currentUser.role);

  useEffect(() => {
    if (projectId && canView) {
      dispatch(entryActions.fetchProjectStats(projectId));
    }
  }, [dispatch, projectId, canView]);

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

  const summary = stats?.summary || {
    boardsTotal: 0,
    membersTotal: 0,
    releasesTotal: 0,
    doneCardsTotal: 0,
    delayedCardsTotal: 0,
    withoutDatesTotal: 0,
  };

  const boardCompletion = useMemo(() => {
    if (!stats?.boards) {
      return [];
    }

    return stats.boards.map((board) => {
      const total = board.cards.total || 0;
      const done = board.cards.done || 0;
      const delayed = board.cards.delayed || 0;
      const remaining = Math.max(total - done - delayed, 0);

      const percent = {
        done: total ? Math.round((done / total) * 100) : 0,
        delayed: total ? Math.round((delayed / total) * 100) : 0,
        remaining: total
          ? Math.max(
              0,
              100 - Math.round((done / total) * 100) - Math.round((delayed / total) * 100),
            )
          : 0,
      };

      return {
        id: board.id,
        name: board.name,
        total,
        done,
        delayed,
        remaining,
        percent,
      };
    });
  }, [stats]);

  const cardsDistribution = useMemo(() => {
    if (!stats?.boards) {
      return {
        total: 0,
        done: 0,
        delayed: 0,
        remaining: 0,
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

    const totalNonZero = totals.total || 1;

    return {
      total: totals.total,
      done: totals.done,
      delayed: totals.delayed,
      remaining,
      percent: {
        done: Math.round((totals.done / totalNonZero) * 100),
        delayed: Math.round((totals.delayed / totalNonZero) * 100),
        remaining: Math.max(
          0,
          100 -
            Math.round((totals.done / totalNonZero) * 100) -
            Math.round((totals.delayed / totalNonZero) * 100),
        ),
      },
    };
  }, [stats]);

  if (!canView) {
    return <Message negative content="Stats are available only for admin and manager roles." />;
  }

  if (isLoading && !stats) {
    return <Loader active inline="centered" />;
  }

  if (error) {
    return (
      <Message
        negative
        header="Unable to load stats"
        content={error.message || 'Please try again later.'}
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div className={styles.heading}>
          <div className={styles.title}>{project?.name || 'Project'}</div>
          <div className={styles.subtitle}>Project analytics overview</div>
        </div>
      </div>

      <div className={styles.cards}>
        <Segment className={styles.card} textAlign="center">
          <Statistic>
            <Statistic.Value>{summary.boardsTotal}</Statistic.Value>
            <Statistic.Label>Boards</Statistic.Label>
          </Statistic>
        </Segment>
        <Segment className={styles.card} textAlign="center">
          <Statistic>
            <Statistic.Value>{summary.membersTotal}</Statistic.Value>
            <Statistic.Label>People in boards</Statistic.Label>
          </Statistic>
        </Segment>
        <Segment className={styles.card} textAlign="center">
          <Statistic>
            <Statistic.Value>{summary.releasesTotal}</Statistic.Value>
            <Statistic.Label>Releases</Statistic.Label>
          </Statistic>
        </Segment>
        <Segment className={styles.card} textAlign="center">
          <Statistic>
            <Statistic.Value>{summary.doneCardsTotal}</Statistic.Value>
            <Statistic.Label>Done cards</Statistic.Label>
          </Statistic>
        </Segment>
        <Segment className={`${styles.card} ${styles.accentRed}`} textAlign="center">
          <Statistic color="red">
            <Statistic.Value>{summary.delayedCardsTotal}</Statistic.Value>
            <Statistic.Label>Delayed cards</Statistic.Label>
          </Statistic>
        </Segment>
        <Segment className={`${styles.card} ${styles.accentOrange}`} textAlign="center">
          <Statistic color="orange">
            <Statistic.Value>{summary.withoutDatesTotal}</Statistic.Value>
            <Statistic.Label>No start/end date</Statistic.Label>
          </Statistic>
        </Segment>
      </div>

      <Segment className={`${styles.section} ${styles.chartsSection}`}>
        <div className={styles.chartCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.title}>Board completion</div>
            <div className={styles.subtitle}>Done vs in-progress</div>
          </div>
          <div className={styles.chartBody}>
            {boardCompletion.length === 0 ? (
              <Message info content="No boards to display yet." />
            ) : (
              boardCompletion.map((board) => (
                <div className={styles.chartRow} key={board.id}>
                  <div className={styles.chartLabel}>{board.name}</div>
                  <div className={styles.barTrack}>
                    <span
                      className={`${styles.barFill} ${styles.barDone}`}
                      style={{ width: `${board.percent.done}%` }}
                    />
                    <span
                      className={`${styles.barFill} ${styles.barDelayed}`}
                      style={{
                        width: `${board.percent.delayed}%`,
                        left: `${board.percent.done}%`,
                      }}
                    />
                    <span
                      className={`${styles.barFill} ${styles.barRemaining}`}
                      style={{
                        width: `${board.percent.remaining}%`,
                        left: `${board.percent.done + board.percent.delayed}%`,
                      }}
                    />
                  </div>
                  <div className={styles.chartValue}>
                    {board.done}/{board.total}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.title}>Cards overview</div>
            <div className={styles.subtitle}>Across all boards</div>
          </div>
          <div className={styles.chartBody}>
            {cardsDistribution.total === 0 ? (
              <Message info content="No cards found for this project." />
            ) : (
              <>
                <div className={styles.barTrack}>
                  <span
                    className={`${styles.barFill} ${styles.barDone}`}
                    style={{ width: `${cardsDistribution.percent.done}%` }}
                  />
                  <span
                    className={`${styles.barFill} ${styles.barDelayed}`}
                    style={{
                      width: `${cardsDistribution.percent.delayed}%`,
                      left: `${cardsDistribution.percent.done}%`,
                    }}
                  />
                  <span
                    className={`${styles.barFill} ${styles.barRemaining}`}
                    style={{
                      width: `${cardsDistribution.percent.remaining}%`,
                      left: `${cardsDistribution.percent.done + cardsDistribution.percent.delayed}%`,
                    }}
                  />
                </div>

                <div className={styles.legend}>
                  <div className={styles.legendItem}>
                    <span className={`${styles.legendSwatch} ${styles.barDone}`} />
                    Done ({cardsDistribution.done})
                  </div>
                  <div className={styles.legendItem}>
                    <span className={`${styles.legendSwatch} ${styles.barDelayed}`} />
                    Delayed ({cardsDistribution.delayed})
                  </div>
                  <div className={styles.legendItem}>
                    <span className={`${styles.legendSwatch} ${styles.barRemaining}`} />
                    In progress ({cardsDistribution.remaining})
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Segment>

      <Segment className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.title}>Boards</div>
          <div className={styles.subtitle}>Card health and timing</div>
        </div>
        <div className={styles.tableWrapper}>
          <Table celled striped compact="very">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Board</Table.HeaderCell>
                <Table.HeaderCell textAlign="right">Cards</Table.HeaderCell>
                <Table.HeaderCell textAlign="right">Done</Table.HeaderCell>
                <Table.HeaderCell textAlign="right">Delayed</Table.HeaderCell>
                <Table.HeaderCell textAlign="right">No start</Table.HeaderCell>
                <Table.HeaderCell textAlign="right">No end</Table.HeaderCell>
                <Table.HeaderCell textAlign="right">No start or end</Table.HeaderCell>
                <Table.HeaderCell textAlign="right">Releases</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(stats?.boards || []).map((board) => {
                const donePercent = board.cards.total
                  ? Math.round((board.cards.done / board.cards.total) * 100)
                  : 0;

                return (
                  <Table.Row key={board.id}>
                    <Table.Cell>
                      <div className={styles.statLabel}>
                        <Icon name="columns" /> {board.name}
                      </div>
                      <div className={styles.progressRow}>
                        <Progress
                          percent={donePercent}
                          size="tiny"
                          color="green"
                          progress
                          label={`Done ${board.cards.done}/${board.cards.total}`}
                        />
                      </div>
                    </Table.Cell>
                    <Table.Cell textAlign="right">{board.cards.total}</Table.Cell>
                    <Table.Cell textAlign="right">{board.cards.done}</Table.Cell>
                    <Table.Cell textAlign="right" negative={board.cards.delayed > 0}>
                      {board.cards.delayed}
                    </Table.Cell>
                    <Table.Cell textAlign="right">{board.cards.withoutStartDate}</Table.Cell>
                    <Table.Cell textAlign="right">{board.cards.withoutDueDate}</Table.Cell>
                    <Table.Cell textAlign="right">{board.cards.withoutDates}</Table.Cell>
                    <Table.Cell textAlign="right">{board.releasesTotal}</Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      </Segment>

      <Segment className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.title}>Releases</div>
          <div className={styles.subtitle}>Across all boards</div>
        </div>
        {releases.length === 0 ? (
          <Message info content="No releases found for this project." />
        ) : (
          <div className={styles.tableWrapper}>
            <Table celled striped compact="very">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Board</Table.HeaderCell>
                  <Table.HeaderCell>Release</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Start</Table.HeaderCell>
                  <Table.HeaderCell>End</Table.HeaderCell>
                  <Table.HeaderCell>Released</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {releases.map((release) => (
                  <Table.Row key={release.id}>
                    <Table.Cell>
                      <div className={styles.statLabel}>
                        <Icon name="columns" /> {release.boardName}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className={styles.metricGroup}>
                        <span className={styles.metric}>
                          <Icon name="tag" className={styles.metricIcon} />
                          {release.version}
                        </span>
                        <span>{release.name}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Label size="small">{release.status}</Label>
                    </Table.Cell>
                    <Table.Cell>
                      {release.startDate ? new Date(release.startDate).toLocaleDateString() : '—'}
                    </Table.Cell>
                    <Table.Cell>
                      {release.endDate ? new Date(release.endDate).toLocaleDateString() : '—'}
                    </Table.Cell>
                    <Table.Cell>
                      {release.releasedAt ? new Date(release.releasedAt).toLocaleString() : '—'}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </Segment>
    </div>
  );
});

export default ProjectStats;
