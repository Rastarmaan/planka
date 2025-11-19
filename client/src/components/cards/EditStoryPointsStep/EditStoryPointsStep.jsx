/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';

import styles from './EditStoryPointsStep.module.scss';

const FIBONACCI_VALUES = [1, 2, 3, 5, 8, 13, 21, 34];
const ADDITIONAL_VALUES = [7, 11];

const EditStoryPointsStep = React.memo(({ cardId, onBack, onClose }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const card = useSelector((state) => selectCardById(state, cardId));
  const defaultValue = card ? card.storyPoints : null;

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const allPresetValues = [...FIBONACCI_VALUES, ...ADDITIONAL_VALUES];
  const isPresetValue = defaultValue !== null && allPresetValues.includes(defaultValue);

  const [storyPoints, setStoryPoints] = useState(defaultValue);
  const [customValue, setCustomValue] = useState(
    defaultValue !== null && !isPresetValue ? String(defaultValue) : '',
  );

  const handlePresetClick = useCallback((value) => {
    setStoryPoints(value);
    setCustomValue('');
  }, []);

  const handleCustomChange = useCallback((event) => {
    const { value } = event.target;
    setCustomValue(value);
    const numValue = parseInt(value, 10);
    if (!Number.isNaN(numValue) && numValue >= 1 && numValue <= 50) {
      setStoryPoints(numValue);
    }
  }, []);

  const handleRemove = useCallback(() => {
    dispatch(
      entryActions.updateCard(cardId, {
        storyPoints: null,
      }),
    );
    onClose();
  }, [cardId, dispatch, onClose]);

  const handleSubmit = useCallback(() => {
    const cleanStoryPoints =
      typeof storyPoints === 'string' ? parseInt(storyPoints, 10) : storyPoints;

    if (
      cleanStoryPoints !== null &&
      (Number.isNaN(cleanStoryPoints) || cleanStoryPoints < 1 || cleanStoryPoints > 50)
    ) {
      return;
    }

    if (cleanStoryPoints !== defaultValue) {
      dispatch(
        entryActions.updateCard(cardId, {
          storyPoints: cleanStoryPoints,
        }),
      );
    }

    onClose();
  }, [cardId, storyPoints, defaultValue, dispatch, onClose]);

  return (
    <>
      <Popup.Header onBack={onBack}>Story Points</Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.fieldWrapper}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className={styles.label}>Story Points:</label>

            <div className={styles.presetButtons}>
              {FIBONACCI_VALUES.map((value) => (
                <Button
                  key={value}
                  type="button"
                  basic={storyPoints !== value}
                  primary={storyPoints === value}
                  compact
                  className={styles.presetButton}
                  onClick={() => handlePresetClick(value)}
                >
                  {value}
                </Button>
              ))}
            </div>

            <div className={styles.additionalButtons}>
              {ADDITIONAL_VALUES.map((value) => (
                <Button
                  key={value}
                  type="button"
                  basic={storyPoints !== value}
                  primary={storyPoints === value}
                  compact
                  className={styles.presetButton}
                  onClick={() => handlePresetClick(value)}
                >
                  {value}
                </Button>
              ))}
            </div>

            <div className={styles.customInput}>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label className={styles.customLabel}>Custom (1-50):</label>
              <input
                type="number"
                min="1"
                max="50"
                value={customValue}
                onChange={handleCustomChange}
                placeholder="Enter custom value"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Button positive content={t('action.save')} />
            {defaultValue !== null && (
              <Button type="button" content="Remove" onClick={handleRemove} />
            )}
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

EditStoryPointsStep.propTypes = {
  cardId: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

EditStoryPointsStep.defaultProps = {
  onBack: undefined,
};

export default EditStoryPointsStep;
