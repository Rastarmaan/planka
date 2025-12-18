/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-unresolved
import flashSvg from '../icons/flash-gray.svg?url';

import styles from './ProjectHistory.module.scss';

const FlashTag = React.memo(({ label }) => (
  <div className={styles.flashContainer}>
    <img src={flashSvg} alt="" className={styles.flashIcon} />
    <span>{label}</span>
  </div>
));

FlashTag.propTypes = {
  label: PropTypes.string.isRequired,
};

const SectionCard = React.memo(({ title, action, children }) => (
  <section className={styles.sectionCard}>
    <div className={styles.sectionHeader}>
      <FlashTag label={title} />
      {action ? <div className={styles.sectionAction}>{action}</div> : null}
    </div>
    <div className={styles.sectionBody}>{children}</div>
  </section>
));

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  action: PropTypes.node,
  children: PropTypes.node.isRequired,
};

SectionCard.defaultProps = {
  action: null,
};

const HISTORY_ITEMS = [
  {
    id: '1',
    user: 'پریماه بخشی',
    date: '۱۴۰۴/۰۷/۱۲',
    content:
      'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری برای طراحان رایانه ای علی الخصوص طراحان خلاق، و فرهنگ پیشرو در زبان فارسی ایجاد کرد، در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی، و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.',
  },
  {
    id: '2',
    user: 'میترا نوری',
    date: '۱۴۰۴/۰۷/۱۲',
    content:
      'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری برای طراحان رایانه ای علی الخصوص طراحان خلاق، و فرهنگ پیشرو در زبان فارسی ایجاد کرد، در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی، و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.',
  },
];

const HistoryItem = React.memo(({ item }) => (
  <article className={styles.historyItem}>
    <div className={styles.historyHeader}>
      <span className={styles.historyUser}>{item.user}</span>
      <span className={styles.historyDate}>{item.date}</span>
    </div>
    <p className={styles.historyContent}>{item.content}</p>
  </article>
));

HistoryItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
};

const ProjectHistory = React.memo(() => {
  return (
    <div className={styles.wrapper}>
      <SectionCard title="مهرماه ۱۴۰۴">
        <div className={styles.historyList}>
          {HISTORY_ITEMS.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
});

export default ProjectHistory;
