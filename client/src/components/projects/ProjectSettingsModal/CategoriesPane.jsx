/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, Header, Tab } from 'semantic-ui-react';

import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';

import styles from './CategoriesPane.module.scss';

const CategoriesPane = React.memo(() => {
  const currentProject = useSelector(selectors.selectCurrentProject);
  const allCategories = useSelector(selectors.selectProjectCategoriesOrderedByName);
  const projectCategories = useSelector((state) =>
    selectors.selectProjectCategoriesForProject(state, currentProject.id),
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const categoryOptions = useMemo(() => {
    return allCategories.map((category) => ({
      key: category.id,
      value: category.id,
      text: category.name,
    }));
  }, [allCategories]);

  const selectedCategoryIds = useMemo(() => {
    return projectCategories.map((category) => category.id);
  }, [projectCategories]);

  const handleCategoryChange = useCallback(
    (_, { value }) => {
      dispatch(entryActions.updateProjectCategories(currentProject.id, value));
    },
    [currentProject.id, dispatch],
  );

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Header as="h4">
        {t('common.projectCategories', {
          context: 'title',
          defaultValue: 'Project Categories',
        })}
      </Header>
      <p className={styles.description}>
        {t('common.selectCategoriesToOrganizeThisProject', {
          defaultValue: 'Select categories to organize this project.',
        })}
      </p>
      <Dropdown
        placeholder={t('common.selectCategories', {
          defaultValue: 'Select categories...',
        })}
        fluid
        multiple
        search
        selection
        options={categoryOptions}
        value={selectedCategoryIds}
        onChange={handleCategoryChange}
        className={styles.dropdown}
      />
      {projectCategories.length > 0 && (
        <div className={styles.selectedCategories}>
          <p className={styles.selectedLabel}>
            {t('common.selectedCategories', {
              defaultValue: 'Selected Categories',
            })}
            :
          </p>
          <div className={styles.categoryList}>
            {projectCategories.map((category) => (
              <div key={category.id} className={styles.categoryItem}>
                <span className={styles.categoryName}>{category.name}</span>
                {category.description && (
                  <span className={styles.categoryDescription}>{category.description}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Tab.Pane>
  );
});

export default CategoriesPane;
