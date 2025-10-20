/*
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Input, Popup } from 'semantic-ui-react';

import selectors from '../../../selectors';
import Item from './Item';

import styles from './EpicsStep.module.scss';

const EpicsStep = React.memo(({ onSelect, onClose }) => {
  const [t] = useTranslation();
  const [search, setSearch] = useState('');

  const epics = useSelector(selectors.selectEpicCardsForCurrentBoard);

  const filtered = useMemo(() => {
    if (!search) return epics;
    const searchLower = search.toLowerCase();
    return epics.filter((e) => e.name.toLowerCase().includes(searchLower));
  }, [epics, search]);

  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value);
  }, []);

  const handleSelect = useCallback(
    (id) => {
      onSelect(id);
      if (onClose) onClose();
    },
    [onSelect, onClose],
  );

  return (
    <>
      <Popup.Header>
        <Input
          fluid
          transparent
          inverted
          icon="search"
          iconPosition="left"
          placeholder={t('common.searchEpics')}
          value={search}
          onChange={handleSearchChange}
        />
      </Popup.Header>
      <Popup.Content>
        <div className={styles.items}>
          {filtered.map((epic) => (
            <Item key={epic.id} id={epic.id} name={epic.name} onSelect={handleSelect} />
          ))}
          {filtered.length === 0 && (
            <div className={styles.message}>
              {search ? t('common.noEpicsFound') : t('common.noEpicsAvailable')}
            </div>
          )}
        </div>
      </Popup.Content>
    </>
  );
});

EpicsStep.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EpicsStep;
