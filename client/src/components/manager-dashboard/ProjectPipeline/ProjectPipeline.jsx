/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import PipelineSection from '../PipelineSection';

import styles from './ProjectPipeline.module.scss';

// Dummy data for demonstration - matching screenshot design
const DUMMY_PROJECTS = [
  {
    id: 'project-1',
    name: 'پروژه فروش محصولات',
    boards: [
      {
        id: 'board-1',
        name: 'کانال فروش اصلی',
        lists: [
          {
            id: 'list-1',
            name: 'مذاکره و توافقات',
            cards: [
              {
                id: 'card-1',
                name: 'در حال مذاکره با عصر ایران...',
                assignee: 'پریماه بخشی',
                dueDate: '۱۴۰۴/۰۹/۱۸',
                createdDate: '۱۴۰۴/۱۰/۲۳',
              },
              {
                id: 'card-2',
                name: 'در حال مذاکره با عصر ایران...',
                assignee: 'پریماه بخشی',
                dueDate: '۱۴۰۴/۰۹/۱۸',
                createdDate: '۱۴۰۴/۱۰/۲۳',
              },
              {
                id: 'card-3',
                name: 'در حال مذاکره با عصر ایران...',
                assignee: 'پریماه بخشی',
                listName: 'عقدقرارداد',
                dueDate: '۱۴۰۴/۰۹/۱۸',
                createdDate: '۱۴۰۴/۱۰/۲۳',
              },
              {
                id: 'card-4',
                name: 'در حال مذاکره با عصر ایران...',
                assignee: 'پریماه بخشی',
                dueDate: '۱۴۰۴/۰۹/۱۸',
                createdDate: '۱۴۰۴/۱۰/۲۳',
              },
              {
                id: 'card-5',
                name: 'در حال مذاکره با عصر ایران...',
                assignee: 'پریماه بخشی',
                dueDate: '۱۴۰۴/۰۹/۱۸',
                createdDate: '۱۴۰۴/۱۰/۲۳',
              },
              {
                id: 'card-6',
                name: 'در حال مذاکره با عصر ایران...',
                assignee: 'پریماه بخشی',
                listName: 'عقدقرارداد',
                dueDate: '۱۴۰۴/۰۹/۱۸',
                createdDate: '۱۴۰۴/۱۰/۲۳',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'project-2',
    name: 'پروژه توسعه نرم‌افزار',
    boards: [
      {
        id: 'board-2',
        name: 'بورد توسعه اصلی',
        lists: [
          {
            id: 'list-2',
            name: 'در حال انجام',
            cards: [
              {
                id: 'card-7',
                name: 'طراحی رابط کاربری داشبورد',
                assignee: 'علی احمدی',
                dueDate: '۱۴۰۴/۰۹/۲۵',
                createdDate: '۱۴۰۴/۰۹/۱۵',
              },
              {
                id: 'card-8',
                name: 'پیاده‌سازی API گزارش‌گیری',
                assignee: 'سارا محمدی',
                dueDate: '۱۴۰۴/۰۹/۲۰',
                createdDate: '۱۴۰۴/۰۹/۱۰',
              },
              {
                id: 'card-9',
                name: 'تست واحد ماژول احراز هویت',
                assignee: 'محمد رضایی',
                listName: 'تکمیل شده',
                dueDate: '۱۴۰۴/۰۹/۱۵',
                createdDate: '۱۴۰۴/۰۹/۰۵',
              },
              {
                id: 'card-10',
                name: 'بهینه‌سازی پایگاه داده',
                assignee: 'فاطمه کریمی',
                dueDate: '۱۴۰۴/۱۰/۰۱',
                createdDate: '۱۴۰۴/۰۹/۲۰',
              },
            ],
          },
        ],
      },
    ],
  },
];

const ProjectPipeline = React.memo(({ selectedProjectId }) => {
  const [t] = useTranslation();

  // Use dummy data instead of Redux store
  const displayProjects = selectedProjectId
    ? DUMMY_PROJECTS.filter((p) => p.id === selectedProjectId)
    : DUMMY_PROJECTS;

  return (
    <div className={styles.wrapper}>
      {displayProjects.map((project) => (
        <PipelineSection key={project.id} project={project} />
      ))}
      {displayProjects.length === 0 && <div className={styles.empty}>{t('common.noProjects')}</div>}
    </div>
  );
});

ProjectPipeline.propTypes = {
  selectedProjectId: PropTypes.string,
};

ProjectPipeline.defaultProps = {
  selectedProjectId: null,
};

export default ProjectPipeline;
