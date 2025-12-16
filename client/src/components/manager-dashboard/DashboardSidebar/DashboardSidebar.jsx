/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from 'semantic-ui-react';

import ManixIcon from '../icons/manix.svg';
import BazicheIcon from '../icons/baziche.svg';
import BitboxIcon from '../icons/bitbox.svg';
import HubgameIcon from '../icons/hubgame.svg';

import styles from './DashboardSidebar.module.scss';

const ICON_MAP = {
  manix: ManixIcon,
  baziche: BazicheIcon,
  bitbox: BitboxIcon,
  hubgame: HubgameIcon,
};

const CATEGORIES = [
  {
    id: 'games',
    name: 'بازی ها',
    expanded: true,
    projects: [
      { id: '1', name: 'دایس مانیکس', icon: 'manix' },
      { id: '2', name: 'بازیچه', icon: 'baziche' },
      { id: '3', name: 'بیت باکس', icon: 'bitbox' },
      { id: '4', name: 'هاب گیم', icon: 'hubgame' },
    ],
  },
  {
    id: 'ai',
    name: 'هوش مصنوعی',
    expanded: true,
    projects: [
      { id: '5', name: 'هیومانی', icon: 'manix' },
      { id: '6', name: 'فلومانی', icon: 'baziche' },
      { id: '7', name: 'مانی جکت', icon: 'bitbox' },
      { id: '8', name: 'میرزا', icon: 'hubgame' },
    ],
  },
];

function ProjectsContainer({ category, selectedProjectId, onProjectClick }) {
  const contentRef = useRef(null);

  return (
    <div
      className={classNames(
        styles.projectsWrapper,
        category.expanded && styles.projectsWrapperExpanded,
      )}
    >
      <div ref={contentRef} className={styles.projectsContainer}>
        {category.projects.map((project, index) => {
          const IconSrc = ICON_MAP[project.icon];
          return (
            <button
              key={project.id}
              type="button"
              className={classNames(
                styles.projectItem,
                selectedProjectId === project.id && styles.projectItemActive,
                index === 0 && styles.projectItemFirst,
              )}
              onClick={() => onProjectClick(project.id)}
            >
              <div className={styles.projectIcon}>
                {IconSrc && (
                  <img src={IconSrc} alt={project.name} className={styles.projectIconImage} />
                )}
              </div>
              <span className={styles.projectName}>{project.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

ProjectsContainer.propTypes = {
  category: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  selectedProjectId: PropTypes.string,
  onProjectClick: PropTypes.func.isRequired,
};

ProjectsContainer.defaultProps = {
  selectedProjectId: null,
};

const DashboardSidebar = React.memo(({ selectedProjectId, onProjectSelect }) => {
  const [categories, setCategories] = useState(CATEGORIES);

  const handleCategoryToggle = useCallback((categoryId) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat)),
    );
  }, []);

  const handleProjectClick = useCallback(
    (projectId) => {
      onProjectSelect(projectId);
    },
    [onProjectSelect],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.logo}>
        <img src="/rastar-logo.svg" alt="rastar logo" className={styles.logoImage} />
      </div>

      <div className={styles.categoriesContainer}>
        {categories.map((category) => (
          <div key={category.id} className={styles.categorySection}>
            <button
              type="button"
              className={styles.categoryHeader}
              onClick={() => handleCategoryToggle(category.id)}
            >
              <span className={styles.categoryName}>{category.name}</span>
              <Icon
                name="chevron down"
                className={classNames(
                  styles.categoryChevron,
                  !category.expanded && styles.categoryChevronCollapsed,
                )}
              />
            </button>

            <ProjectsContainer
              category={category}
              selectedProjectId={selectedProjectId}
              onProjectClick={handleProjectClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

DashboardSidebar.propTypes = {
  selectedProjectId: PropTypes.string,
  onProjectSelect: PropTypes.func.isRequired,
};

DashboardSidebar.defaultProps = {
  selectedProjectId: null,
};

export default DashboardSidebar;
