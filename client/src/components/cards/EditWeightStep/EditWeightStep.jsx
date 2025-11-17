/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Form } from 'semantic-ui-react';
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

  const weightOptions = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        key: i + 1,
        value: i + 1,
        text: `${i + 1}`,
      })),
    [],
  );

  const handleWeightChange = useCallback((event, { value }) => {
    setWeight(value);
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
            <label className={styles.label}>Weight (1-10):</label>

            <Dropdown
              selection
              compact
              value={weight}
              options={weightOptions}
              onChange={handleWeightChange}
              className={styles.dropdown}
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
