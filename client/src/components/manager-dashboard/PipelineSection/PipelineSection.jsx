/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';

import { PipelineCard, membershipShape } from '../PipelineCard';

import styles from './PipelineSection.module.scss';
// eslint-disable-next-line import/no-unresolved
import flashSvg from '../icons/flash.svg?url';

const PipelineSection = React.memo(({ report, phases }) => {
  const visiblePhases = (phases || []).slice(0, 8);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.flashContainer}>
          <img src={flashSvg} alt="flash-icon" className={styles.flashIcon} />
          <span>{report?.name || 'بدون نام'}</span>
        </div>
        <div className={styles.cardsContainer}>
          {visiblePhases.map((phase, index) => (
            <PipelineCard key={phase.id} phase={phase} index={index + 1} />
          ))}
          {visiblePhases.length === 0 && (
            <div className={styles.noCards}>مرحله‌ای ثبت نشده است</div>
          )}
        </div>
      </div>
    </div>
  );
});

PipelineSection.propTypes = {
  report: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
  }).isRequired,
  phases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
      status: PropTypes.string,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      memberships: PropTypes.arrayOf(membershipShape),
    }),
  ),
};

PipelineSection.defaultProps = {
  phases: [],
};

export default PipelineSection;
