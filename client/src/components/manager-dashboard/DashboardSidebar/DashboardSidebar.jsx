/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'redux-orm';

import entryActions from '../../../entry-actions';
import orm from '../../../orm';

import styles from './DashboardSidebar.module.scss';

const UNCATEGORIZED_SECTION_ID = '__uncategorized__';
const UNCATEGORIZED_LABEL = 'بدون دسته‌بندی';
const UNCATEGORIZED_COLOR = '#94a3b8';
const UNNAMED_PROJECT_LABEL = 'پروژه بدون نام';
const EMPTY_CATEGORY_MESSAGE = 'هنوز پروژه‌ای در این دسته ثبت نشده است.';

const getProjectInitials = (value) => {
  if (!value) {
    return '؟';
  }

  const normalized = value.trim().split(/\s+/).filter(Boolean);

  if (normalized.length === 0) {
    return '؟';
  }

  if (normalized.length === 1) {
    return normalized[0].slice(0, 2);
  }

  return `${normalized[0].charAt(0)}${normalized[1].charAt(0)}`;
};

const selectSidebarData = createSelector(
  orm,
  ({ ProjectCategory, Project, ProjectCategoryAssignment }) => {
    const sections = [];
    const sectionById = new Map();
    const categoriesById = new Map();

    ProjectCategory.all()
      .orderBy('name')
      .toModelArray()
      .forEach((categoryModel) => {
        const section = {
          id: String(categoryModel.id),
          name: categoryModel.name,
          color: categoryModel.color,
          projects: [],
        };

        sections.push(section);
        sectionById.set(categoryModel.id, section);
        categoriesById.set(categoryModel.id, categoryModel);
      });

    const assignmentsByProjectId = new Map();

    ProjectCategoryAssignment.all()
      .toRefArray()
      .forEach((assignment) => {
        if (!assignmentsByProjectId.has(assignment.projectId)) {
          assignmentsByProjectId.set(assignment.projectId, []);
        }
        assignmentsByProjectId.get(assignment.projectId).push(assignment.categoryId);
      });

    const uncategorized = [];

    Project.all()
      .orderBy('name')
      .toModelArray()
      .forEach((projectModel) => {
        const projectRef = projectModel.ref;
        const projectName = (projectRef.name || '').trim() || UNNAMED_PROJECT_LABEL;

        const summary = {
          id: String(projectRef.id),
          name: projectName,
          iconUrl: projectRef.iconUrl || null,
          initials: getProjectInitials(projectName),
        };

        const categoryIds = assignmentsByProjectId.get(projectRef.id) || [];

        if (categoryIds.length === 0) {
          uncategorized.push({
            ...summary,
            iconColor: UNCATEGORIZED_COLOR,
          });
          return;
        }

        categoryIds.forEach((categoryId) => {
          const categoryModel = categoriesById.get(categoryId);

          if (!categoryModel) {
            uncategorized.push({
              ...summary,
              iconColor: UNCATEGORIZED_COLOR,
            });
            return;
          }

          let section = sectionById.get(categoryId);

          if (!section) {
            section = {
              id: String(categoryModel.id),
              name: categoryModel.name,
              color: categoryModel.color,
              projects: [],
            };

            sections.push(section);
            sectionById.set(categoryModel.id, section);
          }

          section.projects.push({
            ...summary,
            iconColor: categoryModel.color,
          });
        });
      });

    sections.forEach((section) => {
      section.projects.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
    });

    if (uncategorized.length > 0) {
      uncategorized.sort((a, b) => a.name.localeCompare(b.name, 'fa'));

      sections.push({
        id: UNCATEGORIZED_SECTION_ID,
        name: UNCATEGORIZED_LABEL,
        color: UNCATEGORIZED_COLOR,
        projects: uncategorized,
      });
    }

    const visibleSections = sections.filter((section) => section.projects.length > 0);

    const defaultProjectId = visibleSections.reduce((result, section) => {
      if (result) {
        return result;
      }

      return section.projects[0]?.id || null;
    }, null);

    return {
      sections: visibleSections,
      defaultProjectId: defaultProjectId || null,
    };
  },
);

function ProjectsContainer({ isExpanded, projects, selectedProjectId, onProjectClick }) {
  const hasProjects = projects && projects.length > 0;

  return (
    <div
      className={classNames(styles.projectsWrapper, isExpanded && styles.projectsWrapperExpanded)}
    >
      <div className={styles.projectsContainer} data-empty={!hasProjects}>
        {hasProjects ? (
          projects.map((project) => (
            <button
              key={project.id}
              type="button"
              className={classNames(
                styles.projectItem,
                selectedProjectId === project.id && styles.projectItemActive,
              )}
              onClick={() => onProjectClick(project.id)}
            >
              <div
                className={styles.projectIcon}
                style={{ backgroundColor: project.iconColor || UNCATEGORIZED_COLOR }}
              >
                {project.iconUrl ? (
                  <img src={project.iconUrl} alt="" className={styles.projectIconImage} />
                ) : (
                  <span className={styles.projectIconFallback}>{project.initials}</span>
                )}
              </div>
              <span className={styles.projectName}>{project.name}</span>
            </button>
          ))
        ) : (
          <div className={styles.projectsEmpty}>{EMPTY_CATEGORY_MESSAGE}</div>
        )}
      </div>
    </div>
  );
}

ProjectsContainer.propTypes = {
  isExpanded: PropTypes.bool.isRequired,
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      initials: PropTypes.string.isRequired,
      iconColor: PropTypes.string,
      iconUrl: PropTypes.string,
    }),
  ),
  selectedProjectId: PropTypes.string,
  onProjectClick: PropTypes.func.isRequired,
};

ProjectsContainer.defaultProps = {
  projects: [],
  selectedProjectId: null,
};

const DashboardSidebar = React.memo(({ selectedProjectId, onProjectSelect }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(entryActions.getProjectCategories());
  }, [dispatch]);

  const { sections, defaultProjectId } = useSelector(selectSidebarData);

  useEffect(() => {
    if (!selectedProjectId && defaultProjectId) {
      onProjectSelect(defaultProjectId);
    }
  }, [defaultProjectId, onProjectSelect, selectedProjectId]);

  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    setExpandedSections((prev) => {
      const next = { ...prev };
      let changed = false;

      sections.forEach((section) => {
        if (next[section.id] === undefined) {
          next[section.id] = true;
          changed = true;
        }
      });

      Object.keys(next).forEach((sectionId) => {
        if (!sections.some((section) => section.id === sectionId)) {
          delete next[sectionId];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [sections]);

  const handleCategoryToggle = useCallback((categoryId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
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
        {sections.length === 0 ? (
          <div className={styles.emptyState}>پروژه‌ای برای نمایش وجود ندارد.</div>
        ) : (
          sections.map((section) => {
            const isExpanded = expandedSections[section.id] !== false;
            return (
              <div key={section.id} className={styles.categorySection}>
                <button
                  type="button"
                  className={styles.categoryHeader}
                  onClick={() => handleCategoryToggle(section.id)}
                >
                  <span className={styles.categoryName}>{section.name}</span>
                  <Icon
                    name="chevron down"
                    className={classNames(
                      styles.categoryChevron,
                      !isExpanded && styles.categoryChevronCollapsed,
                    )}
                  />
                </button>

                <ProjectsContainer
                  isExpanded={isExpanded}
                  projects={section.projects}
                  selectedProjectId={selectedProjectId}
                  onProjectClick={handleProjectClick}
                />
              </div>
            );
          })
        )}
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
