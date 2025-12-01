/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Popup } from '../../lib/custom-ui';

import selectors from '../../selectors';

import styles from './BoardReleasesFilterStep.module.scss';

const BoardReleasesFilterStep = React.memo(
  ({ currentIds, title, onSelect, onDeselect, onBack }) => {
    const [t] = useTranslation();

    const currentBoard = useSelector(selectors.selectCurrentBoard);
    const boardId = currentBoard?.id;

    const allReleases = useSelector((state) =>
      boardId ? selectors.selectBoardReleasesByBoardId(state, boardId) : [],
    );

    const releases = useMemo(() => {
      if (!allReleases) return [];
      return [...allReleases].sort((a, b) => {
        if (a.status === 'unreleased' && b.status !== 'unreleased') return -1;
        if (a.status !== 'unreleased' && b.status === 'unreleased') return 1;
        return (b.version || '').localeCompare(a.version || '');
      });
    }, [allReleases]);

    const handleReleaseClick = useCallback(
      (releaseId) => {
        if (currentIds.includes(releaseId)) {
          onDeselect(releaseId);
        } else {
          onSelect(releaseId);
        }
      },
      [currentIds, onSelect, onDeselect],
    );

    return (
      <>
        <Popup.Header onBack={onBack}>
          {t(title || 'common.filterByReleases', {
            defaultValue: 'Filter by releases',
          })}
        </Popup.Header>
        <Popup.Content>
          {releases.length === 0 ? (
            <div className={styles.message}>
              {t('common.noReleases', { defaultValue: 'No releases' })}
            </div>
          ) : (
            <div className={styles.releases}>
              {releases.map((release) => (
                <button
                  key={release.id}
                  type="button"
                  className={styles.release}
                  data-active={currentIds.includes(release.id) || undefined}
                  onClick={() => handleReleaseClick(release.id)}
                >
                  <div className={styles.releaseContent}>
                    <div className={styles.releaseVersion}>{release.version}</div>
                    <div className={styles.releaseName}>{release.name}</div>
                    {release.target && <div className={styles.releaseTarget}>{release.target}</div>}
                  </div>
                  <div className={styles.releaseStatus} data-status={release.status}>
                    {t(`common.${release.status}`, { defaultValue: release.status })}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Popup.Content>
      </>
    );
  },
);

BoardReleasesFilterStep.propTypes = {
  currentIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  title: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

BoardReleasesFilterStep.defaultProps = {
  title: undefined,
  onBack: undefined,
};

export default BoardReleasesFilterStep;
