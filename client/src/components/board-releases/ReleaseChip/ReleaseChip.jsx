/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';

import styles from './ReleaseChip.module.scss';

const Sizes = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

const ReleaseChip = React.memo(({ id, size, onClick }) => {
  const selectBoardReleaseById = useMemo(() => selectors.makeSelectBoardReleaseById(), []);

  const release = useSelector((state) => selectBoardReleaseById(state, id));

  if (!release) {
    return null;
  }

  const contentNode = (
    <span
      title={`${release.version} - ${release.name}`}
      className={classNames(
        styles.wrapper,
        styles[`wrapper${size.charAt(0).toUpperCase() + size.slice(1)}`],
        onClick && styles.wrapperHoverable,
      )}
    >
      <Icon name="flag checkered" className={styles.icon} />
      <span className={styles.version}>{release.version}</span>
      <span className={styles.name}>{release.name}</span>
    </span>
  );

  return onClick ? (
    <button data-id={id} type="button" className={styles.button} onClick={onClick}>
      {contentNode}
    </button>
  ) : (
    contentNode
  );
});

ReleaseChip.propTypes = {
  id: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.values(Sizes)),
  onClick: PropTypes.func,
};

ReleaseChip.defaultProps = {
  size: Sizes.MEDIUM,
  onClick: undefined,
};

export default ReleaseChip;
