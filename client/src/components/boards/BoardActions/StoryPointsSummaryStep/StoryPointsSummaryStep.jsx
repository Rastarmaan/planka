/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';

import styles from './StoryPointsSummaryStep.module.scss';

const StoryPointsSummaryStep = React.memo(({ onBack }) => {
  const lists = useSelector(selectors.selectAvailableListsForCurrentBoard);

  const selectStoryPointsTotalByListId = useMemo(
    () => selectors.makeSelectStoryPointsTotalByListId(),
    [],
  );

  const listSummaries = useSelector((state) => {
    if (!lists) return [];

    return lists
      .map((list) => ({
        id: list.id,
        name: list.name,
        color: list.color,
        storyPoints: selectStoryPointsTotalByListId(state, list.id),
      }))
      .filter((list) => list.storyPoints > 0);
  });

  const totalStoryPoints = listSummaries.reduce((sum, list) => sum + list.storyPoints, 0);

  return (
    <>
      <Popup.Header onBack={onBack}>Story Points Summary</Popup.Header>
      <Popup.Content>
        <div className={styles.wrapper}>
          {listSummaries.length === 0 ? (
            <div className={styles.emptyMessage}>No story points assigned yet</div>
          ) : (
            <>
              <div className={styles.totalSection}>
                <div className={styles.totalLabel}>Total Story Points</div>
                <div className={styles.totalValue}>
                  <Icon name="flag" />
                  {totalStoryPoints}
                </div>
              </div>
              <div className={styles.divider} />
              <div className={styles.listSection}>
                {listSummaries.map((list) => (
                  <div key={list.id} className={styles.listItem}>
                    <div className={styles.listName}>
                      {list.color && <Icon name="circle" style={{ color: list.color }} />}
                      {list.name}
                    </div>
                    <div className={styles.listValue}>{list.storyPoints}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Popup.Content>
    </>
  );
});

StoryPointsSummaryStep.propTypes = {
  onBack: PropTypes.func,
};

StoryPointsSummaryStep.defaultProps = {
  onBack: undefined,
};

export default StoryPointsSummaryStep;
