/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

// eslint-disable-next-line import/no-unresolved
import flashSvg from '../icons/flash.svg?url';

import styles from './ProjectProfile.module.scss';

const SUMMARY_TEXT =
  'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد. کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری برای طراحان رایانه ای علی الخصوص طراحان خلاق، و فرهنگ پیشرو در زبان فارسی ایجاد کرد. در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی، و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.';

const TEAM_MEMBERS = [
  {
    id: 'product-1',
    name: 'پریماه بخشی',
    role: 'مدیر محصول',
    email: 'Parima.bakhshi@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Parima&size=160',
  },
  {
    id: 'content-1',
    name: 'رعنا نکاهی',
    role: 'مدیر محتوا',
    email: 'Rana.Nekahi@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Rana&size=160',
  },
  {
    id: 'designer-1',
    name: 'نازنین خوش سرور',
    role: 'طراح رابط کاربری',
    email: 'Nazanin.Khoshensor@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Nazanin&size=160',
  },
  {
    id: 'designer-2',
    name: 'آرین رضایی',
    role: 'گرافیست',
    email: 'Arian.Rezaie@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Arian&size=160',
  },
  {
    id: 'product-2',
    name: 'پریماه بخشی',
    role: 'مدیر محصول',
    email: 'Parima.bakhshi@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=ParimaB&size=160',
  },
  {
    id: 'product-3',
    name: 'نادر بهشتی',
    role: 'مدیر محصول',
    email: 'Nader.Baheshti@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Nader&size=160',
  },
  {
    id: 'product-4',
    name: 'مهرسا سادات',
    role: 'مدیر محصول',
    email: 'Mehrsa.Sadat@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Mehrsa&size=160',
  },
];

const PROJECT_ACCOUNTS = [
  {
    id: 'telegram-main',
    label: 't.me/dicemaniacs',
    icon: 'telegram plane',
  },
  {
    id: 'telegram-support',
    label: 't.me/dicemaniacs',
    icon: 'telegram plane',
  },
  {
    id: 'telegram-marketing',
    label: 't.me/dicemaniacs',
    icon: 'telegram plane',
  },
  {
    id: 'telegram-sales',
    label: 't.me/dicemaniacs',
    icon: 'telegram plane',
  },
  {
    id: 'telegram-ops',
    label: 't.me/dicemaniacs',
    icon: 'telegram plane',
  },
  {
    id: 'telegram-community',
    label: 't.me/dicemaniacs',
    icon: 'telegram plane',
  },
];

const ATTACHMENTS = [
  {
    id: 'landing-cover-jpg',
    title: 'لندینگ دایس مانیکس',
    url: 'https://t.me/dicemaniacs',
    displayUrl: 't.me/dicemaniacs',
    format: 'jpg',
  },
  {
    id: 'landing-mobile-jpg',
    title: 'لندینگ دایس مانیکس',
    url: 'https://t.me/dicemaniacs',
    displayUrl: 't.me/dicemaniacs',
    format: 'jpg',
  },
  {
    id: 'landing-wireframe-jpg',
    title: 'لندینگ دایس مانیکس',
    url: 'https://t.me/dicemaniacs',
    displayUrl: 't.me/dicemaniacs',
    format: 'jpg',
  },
  {
    id: 'landing-moodboard-jpg',
    title: 'لندینگ دایس مانیکس',
    url: 'https://t.me/dicemaniacs',
    displayUrl: 't.me/dicemaniacs',
    format: 'jpg',
  },
  {
    id: 'landing-animation-gif',
    title: 'لندینگ دایس مانیکس',
    url: 'https://t.me/dicemaniacs',
    displayUrl: 't.me/dicemaniacs',
    format: 'gif',
  },
  {
    id: 'landing-styleguide-png',
    title: 'لندینگ دایس مانیکس',
    url: 'https://t.me/dicemaniacs',
    displayUrl: 't.me/dicemaniacs',
    format: 'png',
  },
  {
    id: 'landing-report-pdf',
    title: 'لندینگ دایس مانیکس',
    url: 'https://t.me/dicemaniacs',
    displayUrl: 't.me/dicemaniacs',
    format: 'pdf',
  },
  {
    id: 'landing-concept-jpg',
    title: 'لندینگ دایس مانیکس',
    url: 'https://t.me/dicemaniacs',
    displayUrl: 't.me/dicemaniacs',
    format: 'jpg',
  },
];

const getInitials = (value) => {
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

  const first = normalized[0].charAt(0);
  const second = normalized[1].charAt(0);
  return `${first}${second}`;
};

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

const TeamMemberCard = React.memo(({ member, index, isHidden }) => (
  <article className={styles.teamCard} data-hidden={isHidden} style={{ '--card-index': index }}>
    <div className={styles.avatar} aria-hidden="true">
      {member.avatar ? (
        <img src={member.avatar} alt="" loading="lazy" />
      ) : (
        <span className={styles.avatarInitials}>{getInitials(member.name)}</span>
      )}
    </div>
    <div className={styles.teamInfo}>
      <span className={styles.role}>{member.role}</span>
      <span className={styles.name}>{member.name}</span>
      <span className={styles.email}>{member.email}</span>
    </div>
  </article>
));

TeamMemberCard.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    avatar: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  isHidden: PropTypes.bool,
};

TeamMemberCard.defaultProps = {
  isHidden: false,
};

const AccountCard = React.memo(({ account }) => (
  <article className={styles.accountCard}>
    <span className={styles.accountLink}>{account.label}</span>
    <span className={styles.accountIconWrapper} aria-hidden="true">
      <Icon name={account.icon || 'external share'} size="small" className={styles.accountIcon} />
    </span>
  </article>
));

AccountCard.propTypes = {
  account: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string,
  }).isRequired,
};

const AttachmentCard = React.memo(({ item }) => (
  <article className={styles.attachmentCard}>
    <div className={`${styles.attachmentIcon} ${styles[`attachmentIcon--${item.format}`]}`}>
      <span className={`${styles.attachmentBadge} ${styles[`attachmentBadge--${item.format}`]}`}>
        {item.format.toUpperCase()}
      </span>
    </div>
    <div className={styles.attachmentContent}>
      <span className={styles.attachmentTitle}>{item.title}</span>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.attachmentLink}
      >
        <span>{item.displayUrl}</span>
        <Icon name="linkify" size="small" className={styles.attachmentLinkIcon} />
      </a>
    </div>
  </article>
));

AttachmentCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    displayUrl: PropTypes.string.isRequired,
    format: PropTypes.string.isRequired,
  }).isRequired,
};

const INITIAL_VISIBLE_COUNT = 5;
const COLLAPSE_ANIMATION_MS = 350;

const ProjectProfile = React.memo(() => {
  const totalMembers = TEAM_MEMBERS.length;
  const hasHiddenMembers = totalMembers > INITIAL_VISIBLE_COUNT;

  const collapseTimerRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);

  const handleToggle = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }

    if (isExpanded) {
      setIsExpanded(false);
      collapseTimerRef.current = window.setTimeout(() => {
        setVisibleCount(INITIAL_VISIBLE_COUNT);
        collapseTimerRef.current = null;
      }, COLLAPSE_ANIMATION_MS);
    } else {
      setVisibleCount(totalMembers);
      requestAnimationFrame(() => {
        setIsExpanded(true);
      });
    }
  };

  return (
    <div className={styles.wrapper}>
      <SectionCard title="چکیده پروژه">
        <p className={styles.summaryText}>{SUMMARY_TEXT}</p>
      </SectionCard>

      <SectionCard title="تیم پروژه">
        <div
          className={styles.teamGrid}
          data-expanded={isExpanded}
          style={{ '--card-total': totalMembers }}
        >
          {TEAM_MEMBERS.slice(0, visibleCount).map((member, index) => {
            const isHidden = !isExpanded && index >= INITIAL_VISIBLE_COUNT;
            return (
              <TeamMemberCard key={member.id} member={member} index={index} isHidden={isHidden} />
            );
          })}
        </div>
        {hasHiddenMembers ? (
          <div className={styles.teamFooter}>
            <button
              type="button"
              className={styles.moreButton}
              data-expanded={isExpanded}
              aria-expanded={isExpanded}
              onClick={handleToggle}
            >
              <Icon
                aria-hidden="true"
                name={isExpanded ? 'arrow right' : 'arrow left'}
                size="small"
                className={styles.moreButtonIcon}
              />
              <span>{isExpanded ? 'کمتر' : 'بیشتر'}</span>
            </button>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="اکانت‌های پروژه">
        <div className={styles.accountGrid}>
          {PROJECT_ACCOUNTS.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="پیوست">
        <div className={styles.attachmentGrid}>
          {ATTACHMENTS.map((item) => (
            <AttachmentCard key={item.id} item={item} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
});

export default ProjectProfile;
