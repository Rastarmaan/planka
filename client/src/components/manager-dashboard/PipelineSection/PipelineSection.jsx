/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';

import PipelineCard from '../PipelineCard';

import styles from './PipelineSection.module.scss';
// eslint-disable-next-line import/no-unresolved
import flashSvg from '../icons/flash.svg?url';

const PipelineSection = React.memo(({ project }) => {
  const allCards =
    project.boards?.flatMap(
      (board) =>
        board.lists?.flatMap(
          (list) =>
            list.cards?.map((card) => ({
              ...card,
              listName: list.name,
            })) || [],
        ) || [],
    ) || [];

  return (
    <div className={styles.wrapper}>
      <div className={styles.flashContainer}>
        <img src={flashSvg} alt="flash-icon" className={styles.flashIcon} />
        <span>{project.name}</span>
      </div>
      <div className={styles.cardsContainer}>
        {allCards.slice(0, 8).map((card, index) => (
          <PipelineCard key={card.id} card={card} index={index + 1} />
        ))}
        {allCards.length === 0 && <div className={styles.noCards}>No cards available</div>}
      </div>
    </div>
  );
});

PipelineSection.propTypes = {
  project: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default PipelineSection;
