/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from 'semantic-ui-react';
import { CARD_COLORS } from '../../../constants/CardColors';

import styles from './CardColorPickerStep.module.scss';

const CardColorPickerStep = React.memo(({ currentColor, onSelect, onClose }) => {
  const [t] = useTranslation();

  const handleColorClick = useCallback(
    (colorKey) => {
      onSelect(colorKey);
      onClose();
    },
    [onSelect, onClose],
  );

  const handleClearClick = useCallback(() => {
    onSelect(null);
    onClose();
  }, [onSelect, onClose]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Icon name="paint brush" />
        {t('common.selectCardColor', { defaultValue: 'Select Card Color' })}
      </div>
      <div className={styles.colorGrid}>
        {CARD_COLORS.map((colorItem) => (
          <button
            key={colorItem.key}
            type="button"
            className={styles.colorButton}
            style={{ backgroundColor: colorItem.color }}
            onClick={() => handleColorClick(colorItem.key)}
            title={colorItem.name}
          >
            {currentColor === colorItem.key && <Icon name="check" className={styles.checkIcon} />}
          </button>
        ))}
      </div>
      {currentColor && (
        <Button fluid size="small" onClick={handleClearClick} className={styles.clearButton}>
          <Icon name="close" />
          {t('action.clearColor', { defaultValue: 'Clear Color' })}
        </Button>
      )}
    </div>
  );
});

CardColorPickerStep.propTypes = {
  currentColor: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

CardColorPickerStep.defaultProps = {
  currentColor: null,
};

export default CardColorPickerStep;
