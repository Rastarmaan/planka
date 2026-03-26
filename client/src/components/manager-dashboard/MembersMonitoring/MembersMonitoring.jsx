/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

import delayIllustration from '../icons/delay.svg';
import UserActivityChart from './UserActivityChart';
import styles from './MembersMonitoring.module.scss';

const FILTER_OPTIONS = ['ماه', 'هفته', 'روز'];

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

const toPersianDigits = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).replace(/\d/g, (digit) => FA_DIGITS[Number(digit)]);
};

const clamp = (value, min = 0, max = 100) => {
  if (Number.isNaN(Number(value))) {
    return min;
  }

  return Math.min(max, Math.max(min, Number(value)));
};

const CHART_LABELS = [
  'فروردین ۱۴۰۴',
  'اردیبهشت ۱۴۰۴',
  'خرداد ۱۴۰۴',
  'تیر ۱۴۰۴',
  'مرداد ۱۴۰۴',
  'شهریور ۱۴۰۴',
  'مهر ۱۴۰۴',
  'آبان ۱۴۰۴',
];

const DEFAULT_BAR_VALUES = [40, 60, 25, 68, 85, 100, 100];
const DEFAULT_LINE_VALUES = [32, 55, 28, 65, 89, 95, 97];

const createChartPoints = (bars, lines, labels) =>
  bars.map((barValue, index) => {
    const safeBar = clamp(barValue);
    const safeLine = clamp(lines[index] ?? barValue);
    return {
      label: labels[index] || '',
      bar: safeBar,
      line: safeLine,
      badge: `${toPersianDigits(Math.round(safeLine))}٪`,
    };
  });

const createShiftedChartPoints = (barShift = 0, lineShift = barShift) => {
  const bars = DEFAULT_BAR_VALUES.map((value, index) => {
    const shiftValue = Array.isArray(barShift) ? (barShift[index] ?? 0) : barShift;
    return value + shiftValue;
  });

  const lines = DEFAULT_LINE_VALUES.map((value, index) => {
    const shiftValue = Array.isArray(lineShift) ? (lineShift[index] ?? 0) : lineShift;
    return value + shiftValue;
  });

  return createChartPoints(bars, lines, CHART_LABELS);
};

const BASE_MEMBER = {
  role: 'مدیر محصول',
  meta: 'آخرین بازدید ۳ ساعت قبل',
  email: 'team@planka.io',
  avatar: 'https://api.dicebear.com/7.x/notionists/png?seed=Planka&size=200',
  location: 'آلمان',
  status: 'آنلاین',
  delayHours: 12,
  delayText: 'تاخیر محاسبه شده تا امروز: ۱۲ ساعت',
  lastTask: '۳ روز قبل',
  assignedTasksYear: 640,
  totalTasks: 820,
  weightValue: 9,
  weightScale: 10,
  chartPoints: createShiftedChartPoints(),
};

const MEMBER_OVERRIDES = [
  {
    id: 'parima-bakhshi',
    name: 'پریماه بخشی',
    meta: 'آخرین بازدید ۳ ساعت قبل',
    email: 'Parima.bakhshi@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/notionists/png?seed=Parima&size=200',
    location: 'آلمان',
    status: 'آنلاین',
    delayHours: 15,
    lastTask: '۳ روز قبل',
    assignedTasksYear: 750,
    totalTasks: 940,
    weightValue: 11,
    weightScale: 10,
  },
  {
    id: 'niloofar-hosseini',
    name: 'نیلوفر حسینی',
    meta: 'آنلاین',
    email: 'Niloofar.Hosseini@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/notionists/png?seed=Niloofar&size=200',
    location: 'ایران',
    status: 'آنلاین',
    delayHours: 8,
    lastTask: '۱ روز قبل',
    assignedTasksYear: 680,
    totalTasks: 820,
    weightValue: 9,
    chartShift: -4,
  },
  {
    id: 'arian-rezaei',
    name: 'آرین رضایی',
    meta: 'آخرین بازدید ۱۵ روز قبل',
    email: 'Arian.Rezaei@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/notionists/png?seed=Arian&size=200',
    location: 'فرانسه',
    status: 'آفلاین',
    delayHours: 22,
    lastTask: '۱۵ روز قبل',
    assignedTasksYear: 540,
    totalTasks: 640,
    weightValue: 7,
    chartShift: -12,
  },
  {
    id: 'parsa-dana',
    name: 'پارسا دانا',
    meta: 'آنلاین',
    email: 'Parsa.Dana@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/notionists/png?seed=Parsa&size=200',
    location: 'ایران',
    status: 'مشغول',
    delayHours: 6,
    lastTask: '۲ روز قبل',
    assignedTasksYear: 710,
    totalTasks: 910,
    weightValue: 10,
    chartShift: 2,
  },
  {
    id: 'elham-rahimi',
    name: 'الهام رحیمی',
    meta: 'آخرین بازدید ۵ روز قبل',
    email: 'Elham.Rahimi@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/notionists/png?seed=Elham&size=200',
    location: 'آلمان',
    status: 'مرخصی',
    delayHours: 4,
    lastTask: '۵ روز قبل',
    assignedTasksYear: 620,
    totalTasks: 780,
    weightValue: 8,
    chartShift: -6,
  },
  {
    id: 'arman-shahbazi',
    name: 'آرمان شهبازی',
    meta: 'آخرین بازدید ۲ روز قبل',
    email: 'Arman.Shahbazi@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/notionists/png?seed=Arman&size=200',
    location: 'کانادا',
    status: 'آنلاین',
    delayHours: 10,
    lastTask: '۲ روز قبل',
    assignedTasksYear: 705,
    totalTasks: 880,
    weightValue: 10,
    chartShift: 4,
  },
  {
    id: 'sara-sadeghi',
    name: 'سارا صادقی',
    meta: 'آنلاین',
    email: 'Sara.Sadeghi@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/notionists/png?seed=Sara&size=200',
    location: 'ایران',
    status: 'آنلاین',
    delayHours: 5,
    lastTask: '۴ روز قبل',
    assignedTasksYear: 660,
    totalTasks: 810,
    weightValue: 9,
    chartShift: -2,
  },
  {
    id: 'mahya-bayat',
    name: 'مهیا بیات',
    meta: 'آخرین بازدید ۷ ساعت قبل',
    email: 'Mahya.Bayat@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/notionists/png?seed=Mahya&size=200',
    location: 'آلمان',
    status: 'مشغول',
    delayHours: 11,
    lastTask: '۷ روز قبل',
    assignedTasksYear: 720,
    totalTasks: 900,
    weightValue: 10,
    chartShift: 3,
  },
  {
    id: 'mehrad-tavasoli',
    name: 'مهراد توسلی',
    meta: 'آخرین بازدید ۹ ساعت قبل',
    email: 'Mehrad.Tavasoli@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/notionists/png?seed=Mehrad&size=200',
    location: 'ایران',
    status: 'آنلاین',
    delayHours: 9,
    lastTask: '۳ روز قبل',
    assignedTasksYear: 690,
    totalTasks: 860,
    weightValue: 9,
    chartShift: 1,
  },
  {
    id: 'narges-karimi',
    name: 'نرگس کریمی',
    meta: 'آنلاین',
    email: 'Narges.Karimi@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/notionists/png?seed=Narges&size=200',
    location: 'آلمان',
    status: 'آنلاین',
    delayHours: 3,
    lastTask: '۲ روز قبل',
    assignedTasksYear: 610,
    totalTasks: 770,
    weightValue: 8,
    chartShift: -3,
  },
  {
    id: 'ramin-soleimani',
    name: 'رامین سلیمانی',
    meta: 'آخرین بازدید ۱ روز قبل',
    email: 'Ramin.Soleimani@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/notionists/png?seed=Ramin&size=200',
    location: 'سوئد',
    status: 'آفلاین',
    delayHours: 18,
    lastTask: '۹ روز قبل',
    assignedTasksYear: 580,
    totalTasks: 720,
    weightValue: 7,
    chartShift: -8,
  },
  {
    id: 'taraneh-motamedi',
    name: 'ترانه معتمدی',
    meta: 'آخرین بازدید ۱۲ ساعت قبل',
    email: 'Taraneh.Motamedi@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/notionists/png?seed=Taraneh&size=200',
    location: 'آلمان',
    status: 'مشغول',
    delayHours: 13,
    lastTask: '۵ روز قبل',
    assignedTasksYear: 702,
    totalTasks: 880,
    weightValue: 10,
    chartShift: 5,
  },
];

const CURRENT_COURSES = [
  { id: 1, title: 'UI/UX Design', count: '30 + Courses', color: '#F2C94C' },
  { id: 2, title: 'Marketing', count: '25 + Courses', color: '#EB5757' },
  { id: 3, title: 'Web Development', count: '20 + Courses', color: '#6FCF97' },
];

const PASSED_COURSES = [
  { id: 4, title: 'UI/UX Design', count: '30 + Courses', color: '#F2C94C' },
  { id: 5, title: 'Marketing', count: '25 + Courses', color: '#EB5757' },
  { id: 6, title: 'Web Development', count: '20 + Courses', color: '#6FCF97' },
  { id: 7, title: 'Data Science', count: '15 + Courses', color: '#F2C94C' },
  { id: 8, title: 'Graphic Design', count: '18 + Courses', color: '#EB5757' },
];

const MEMBERS = MEMBER_OVERRIDES.map((override) => {
  const { chartShift = 0, lineShift = chartShift, chartPoints, delayText, ...rest } = override;
  const delayHours = rest.delayHours ?? BASE_MEMBER.delayHours;

  return {
    ...BASE_MEMBER,
    ...rest,
    delayHours,
    chartPoints: chartPoints || createShiftedChartPoints(chartShift, lineShift),
    delayText: delayText || `تاخیر محاسبه شده تا امروز: ${toPersianDigits(delayHours)} ساعت`,
  };
});

function FilterGroup({ value, onSelect, variant = 'segmented' }) {
  return (
    <div className={styles.filterGroup} data-variant={variant}>
      {FILTER_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          className={styles.filterButton}
          data-active={value === option}
          data-variant={variant}
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

FilterGroup.propTypes = {
  value: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['segmented', 'select']),
};

FilterGroup.defaultProps = {
  variant: 'segmented',
};

const MembersMonitoring = React.memo(() => {
  const [activeMemberId, setActiveMemberId] = useState(MEMBERS[0].id);
  const [isDetailsView, setIsDetailsView] = useState(false);
  const [delayPrimaryFilter, setDelayPrimaryFilter] = useState(FILTER_OPTIONS[0]);
  const [reportFilter, setReportFilter] = useState(FILTER_OPTIONS[0]);

  const activeMember = useMemo(
    () => MEMBERS.find((member) => member.id === activeMemberId) || MEMBERS[0],
    [activeMemberId],
  );

  const handleSelectMember = useCallback((memberId) => {
    setActiveMemberId(memberId);
    setIsDetailsView(true);
  }, []);

  const handleBack = useCallback(() => {
    setIsDetailsView(false);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>مانیتورینگ اعضای رستار</h2>
        {isDetailsView && (
          <button type="button" className={styles.backButton} onClick={handleBack}>
            بازگشت
            <Icon name="arrow left" />
          </button>
        )}
      </div>
      <div className={styles.container}>
        {isDetailsView ? (
          <section className={styles.details} aria-live="polite">
            <div className={styles.detailTop}>
              <article className={styles.profileFrame}>
                <div className={styles.profileContent}>
                  <div className={styles.profileImage} aria-hidden="true">
                    <img src={activeMember.avatar} alt="" loading="lazy" />
                  </div>
                  <div className={styles.profileText}>
                    <span className={styles.profileRole}>{activeMember.role}</span>
                    <h3 className={styles.profileName}>{activeMember.name}</h3>
                    <span className={styles.profileEmail}>{activeMember.email}</span>
                    <span className={styles.profileStatusText}>{activeMember.status}</span>
                  </div>
                </div>
              </article>

              <article className={`${styles.detailCard} ${styles.delayCard}`}>
                <div className={styles.delayArtwork} aria-hidden="true">
                  <img src={delayIllustration} alt="" loading="lazy" />
                </div>
                <div className={styles.delayContent}>
                  <div className={styles.delayHeader}>
                    <h3 className={styles.delayTitle}>تاخیر در ثبت تردد</h3>
                  </div>
                  <div className={styles.delayFilters}>
                    <FilterGroup
                      value={delayPrimaryFilter}
                      onSelect={setDelayPrimaryFilter}
                      variant="select"
                    />
                  </div>
                  <p className={styles.delayCaption}>{activeMember.delayText}</p>
                </div>
              </article>
            </div>

            <article className={styles.reportCard}>
              <div className={styles.reportHeader}>
                <h3 className={styles.reportTitle}>گزارش کاربر</h3>
                <div className={styles.reportFilters}>
                  <FilterGroup value={reportFilter} onSelect={setReportFilter} variant="select" />
                </div>
              </div>

              <UserActivityChart data={activeMember.chartPoints} />

              <div className={styles.reportStats}>
                <div className={styles.statsContent}>
                  <div className={styles.statsHeader}>
                    <div className={styles.statsIcon} aria-hidden="true" />
                    <h4 className={styles.statsTitle}>وظایف ارجاع شده</h4>
                  </div>
                  <p className={styles.statsHighlight}>
                    وظایف کاربر در ۱۲ ماه گذشته : {toPersianDigits(activeMember.assignedTasksYear)}
                  </p>
                  <p className={styles.statsRow}>
                    کل وظایف: {toPersianDigits(activeMember.totalTasks)}
                  </p>
                  <p className={styles.statsRow}>
                    وزن وظایف : {toPersianDigits(activeMember.weightValue)} از{' '}
                    {toPersianDigits(activeMember.weightScale)}
                  </p>
                </div>

                <div className={styles.statsFooter}>
                  <span className={styles.lastTask}>زمان آخرین وظیفه :{activeMember.lastTask}</span>
                </div>
              </div>
            </article>

            <article className={styles.coursesCard}>
              <div className={styles.coursesHeader}>
                <h3 className={styles.coursesTitle}>دوره های آموزشی</h3>
                <span className={styles.coursesStat}>تعداد دوره های گذرانده شده : ۲۰</span>
              </div>

              <div className={styles.coursesBody}>
                <section className={styles.courseSection}>
                  <h4 className={styles.sectionTitle}>دوره های جاری</h4>
                  <div className={styles.courseList}>
                    {CURRENT_COURSES.map((course) => (
                      <div key={course.id} className={styles.courseItem}>
                        <div className={styles.courseContent}>
                          <div
                            className={styles.courseIcon}
                            style={{ backgroundColor: course.color }}
                          />
                          <div className={styles.courseInfo}>
                            <span className={styles.courseName}>{course.title}</span>
                            <span className={styles.courseCount}>{course.count}</span>
                          </div>
                        </div>
                        <button type="button" className={styles.courseButton}>
                          مشاهده دوره ها
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.courseSection}>
                  <h4 className={styles.sectionTitle}>دوره های گذرانده شده</h4>
                  <div className={styles.courseList}>
                    {PASSED_COURSES.map((course) => (
                      <div key={course.id} className={styles.courseItem}>
                        <div className={styles.courseContent}>
                          <div
                            className={styles.courseIcon}
                            style={{ backgroundColor: course.color }}
                          />
                          <div className={styles.courseInfo}>
                            <span className={styles.courseName}>{course.title}</span>
                            <span className={styles.courseCount}>{course.count}</span>
                          </div>
                        </div>
                        <button type="button" className={styles.courseButton}>
                          مشاهده دوره ها
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </article>
          </section>
        ) : (
          <section className={styles.listSection} aria-label="لیست اعضا">
            <div className={styles.grid}>
              {MEMBERS.map((member) => {
                const isActive = member.id === activeMemberId;
                return (
                  <button
                    key={member.id}
                    type="button"
                    className={styles.card}
                    data-active={isActive}
                    onClick={() => handleSelectMember(member.id)}
                  >
                    <div className={styles.avatar} aria-hidden="true">
                      <img src={member.avatar} alt="" loading="lazy" />
                    </div>
                    <div className={styles.info}>
                      <span className={styles.role}>{member.role}</span>
                      <span className={styles.name}>{member.name}</span>
                      <span className={styles.meta}>{member.meta}</span>
                    </div>
                    <span className={styles.monitorButton}>مشاهده مانیتورینگ کاربر</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
});

export default MembersMonitoring;
