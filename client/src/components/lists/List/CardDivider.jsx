/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from 'semantic-ui-react';

import styles from './CardDivider.module.scss';

const CardDivider = React.memo(({ onClick, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <div
      className={classNames(styles.wrapper, (isHovered || isActive) && styles.wrapperVisible)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button type="button" className={styles.button} onClick={handleClick}>
        <div className={styles.line} />
        <div className={styles.iconWrapper}>
          <Icon size="small" name="plus" className={styles.icon} />
        </div>
        <div className={styles.line} />
      </button>
    </div>
  );
});

CardDivider.propTypes = {
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
};

CardDivider.defaultProps = {
  isActive: false,
};

export default CardDivider;
