/*!
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

import styles from './StoriesStep.module.scss';

const StoriesStep = React.memo(({ onSelect, onClose }) => {
  const [t] = useTranslation();
  const [search, setSearch] = useState('');

  const stories = useSelector(selectors.selectStoryCardsForCurrentBoard);

  const filteredStories = useMemo(() => {
    if (!search) {
      return stories;
    }

    const searchLower = search.toLowerCase();
    return stories.filter((story) => story.name.toLowerCase().includes(searchLower));
  }, [stories, search]);

  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value);
  }, []);

  const handleStorySelect = useCallback(
    (storyId) => {
      onSelect(storyId);
      if (onClose) {
        onClose();
      }
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
          placeholder={t('common.searchStories')}
          value={search}
          onChange={handleSearchChange}
        />
      </Popup.Header>
      <Popup.Content>
        <div className={styles.items}>
          {filteredStories.map((story) => (
            <Item key={story.id} id={story.id} name={story.name} onSelect={handleStorySelect} />
          ))}
          {filteredStories.length === 0 && (
            <div className={styles.message}>
              {search ? t('common.noStoriesFound') : t('common.noStoriesAvailable')}
            </div>
          )}
        </div>
      </Popup.Content>
    </>
  );
});

StoriesStep.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default StoriesStep;
