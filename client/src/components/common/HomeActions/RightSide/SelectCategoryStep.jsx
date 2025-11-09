/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Icon, Menu } from 'semantic-ui-react';
import { Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';

import styles from './SelectCategoryStep.module.scss';

const SelectCategoryStep = React.memo(({ value, onSelect, onClose }) => {
  const [t] = useTranslation();
  const categories = useSelector(selectors.selectProjectCategoriesOrderedByName);

  const handleSelectClick = useCallback(
    (_, { value: nextValue }) => {
      if (nextValue !== value) {
        onSelect(nextValue);
      }

      onClose();
    },
    [value, onSelect, onClose],
  );

  return (
    <>
      <Popup.Header>
        {t('common.selectCategory', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          <Menu.Item
            value={null}
            active={value === null}
            className={styles.menuItem}
            onClick={handleSelectClick}
          >
            <Icon name="th list" className={styles.menuItemIcon} />
            <span className={styles.menuItemText}>{t('common.allCategories')}</span>
          </Menu.Item>
          {categories.map((category) => (
            <Menu.Item
              key={category.id}
              value={category.id}
              active={category.id === value}
              className={styles.menuItem}
              onClick={handleSelectClick}
            >
              <Icon name="folder outline" className={styles.menuItemIcon} />
              <span className={styles.menuItemText}>{category.name}</span>
            </Menu.Item>
          ))}
        </Menu>
      </Popup.Content>
    </>
  );
});

SelectCategoryStep.propTypes = {
  value: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

SelectCategoryStep.defaultProps = {
  value: null,
};

export default SelectCategoryStep;
