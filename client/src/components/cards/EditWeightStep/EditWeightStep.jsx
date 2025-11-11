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

import styles from './EditWeightStep.module.scss';

const EditWeightStep = React.memo(({ cardId, onBack, onClose }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const card = useSelector((state) => selectCardById(state, cardId));
  const defaultValue = card ? card.weight || 1 : 1;

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [weight, setWeight] = useState(defaultValue);

  const handleWeightChange = useCallback((event) => {
    const value = parseInt(event.target.value, 10);
    if (!Number.isNaN(value) && value >= 1 && value <= 10) {
      setWeight(value);
    } else if (event.target.value === '') {
      setWeight('');
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const cleanWeight = typeof weight === 'string' ? parseInt(weight, 10) : weight;

    if (Number.isNaN(cleanWeight) || cleanWeight < 1 || cleanWeight > 10) {
      return;
    }

    if (cleanWeight !== defaultValue) {
      dispatch(
        entryActions.updateCard(cardId, {
          weight: cleanWeight,
        }),
      );
    }

    onClose();
  }, [cardId, weight, defaultValue, dispatch, onClose]);

  return (
    <>
      <Popup.Header onBack={onBack}>Weight</Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.fieldWrapper}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="weight" className={styles.label}>
              Weight (1-10):
            </label>

            <input
              type="number"
              id="weight"
              name="weight"
              min="1"
              max="10"
              value={weight}
              className={styles.input}
              onChange={handleWeightChange}
            />
          </div>
          <Button positive content={t('action.save')} />
        </Form>
      </Popup.Content>
    </>
  );
});

EditWeightStep.propTypes = {
  cardId: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

EditWeightStep.defaultProps = {
  onBack: undefined,
};

export default EditWeightStep;
