/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';

import defaultAvatar from '../icons/default.svg';
import styles from './DashboardHeader.module.scss';

const DashboardHeader = React.memo(({ user }) => {
  const [t] = useTranslation();

  return (
    <div className={styles.wrapper}>
      <div className={styles.rightSection}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder={t('common.search', { defaultValue: 'جست و جو' })}
            className={styles.searchInput}
          />
          <svg
            className={styles.searchIcon}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
              stroke="#969BA0"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 22L20 20"
              stroke="#969BA0"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className={styles.leftSection}>
        <div className={styles.actionsContainer}>
          <div type="button" className={styles.actionButton}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                opacity="0.4"
                d="M25.7866 19.32L24.4533 17.1067C24.1733 16.6134 23.92 15.68 23.92 15.1334V11.76C23.92 7.41337 20.3866 3.8667 16.0266 3.8667C11.6666 3.8667 8.1333 7.41337 8.1333 11.76V15.1334C8.1333 15.68 7.87996 16.6134 7.59996 17.0934L6.2533 19.32C5.71996 20.2134 5.59996 21.2 5.9333 22.1067C6.2533 23 7.0133 23.6934 7.99996 24.0267C10.5866 24.9067 13.3066 25.3334 16.0266 25.3334C18.7466 25.3334 21.4666 24.9067 24.0533 24.04C24.9866 23.7334 25.7066 23.0267 26.0533 22.1067C26.4 21.1867 26.3066 20.1734 25.7866 19.32Z"
                fill="#49A6AF"
              />
              <path
                d="M19 4.42663C18.08 4.06663 17.08 3.86663 16.0267 3.86663C14.9867 3.86663 13.9867 4.05329 13.0667 4.42663C13.64 3.34663 14.7733 2.66663 16.0267 2.66663C17.2933 2.66663 18.4133 3.34663 19 4.42663Z"
                fill="#49A6AF"
              />
              <path
                d="M19.7733 26.68C19.2133 28.2266 17.7333 29.3333 16 29.3333C14.9467 29.3333 13.9067 28.9066 13.1733 28.1466C12.7467 27.7466 12.4267 27.2133 12.24 26.6666C12.4133 26.6933 12.5867 26.7066 12.7733 26.7333C13.08 26.7733 13.4 26.8133 13.72 26.84C14.48 26.9066 15.2533 26.9466 16.0267 26.9466C16.7867 26.9466 17.5467 26.9066 18.2933 26.84C18.5733 26.8133 18.8533 26.8 19.12 26.76C19.3333 26.7333 19.5467 26.7066 19.7733 26.68Z"
                fill="#49A6AF"
              />
            </svg>
          </div>
          <div type="button" className={styles.actionButton}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                opacity="0.4"
                d="M22.6666 27.3333H9.33329C5.33329 27.3333 2.66663 25.3333 2.66663 20.6666V11.3333C2.66663 6.66663 5.33329 4.66663 9.33329 4.66663H22.6666C26.6666 4.66663 29.3333 6.66663 29.3333 11.3333V20.6666C29.3333 25.3333 26.6666 27.3333 22.6666 27.3333Z"
                fill="#49A6AF"
              />
              <path
                d="M16 17.16C14.88 17.16 13.7467 16.8133 12.88 16.1066L8.70665 12.7733C8.27999 12.4266 8.19999 11.8 8.54666 11.3733C8.89333 10.9466 9.52 10.8666 9.94666 11.2133L14.12 14.5466C15.1333 15.36 16.8533 15.36 17.8666 14.5466L22.04 11.2133C22.4667 10.8666 23.1067 10.9333 23.44 11.3733C23.7867 11.8 23.72 12.44 23.28 12.7733L19.1067 16.1066C18.2533 16.8133 17.12 17.16 16 17.16Z"
                fill="#49A6AF"
              />
            </svg>
          </div>

          <div type="button" className={styles.actionButton}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                opacity="0.4"
                d="M2.66663 17.1733V14.8267C2.66663 13.44 3.79996 12.2933 5.19996 12.2933C7.61329 12.2933 8.59996 10.5867 7.38663 8.49333C6.69329 7.29333 7.10663 5.73333 8.31996 5.04L10.6266 3.72C11.68 3.09333 13.04 3.46666 13.6666 4.52L13.8133 4.77333C15.0133 6.86666 16.9866 6.86666 18.2 4.77333L18.3466 4.52C18.9733 3.46666 20.3333 3.09333 21.3866 3.72L23.6933 5.04C24.9066 5.73333 25.32 7.29333 24.6266 8.49333C23.4133 10.5867 24.4 12.2933 26.8133 12.2933C28.2 12.2933 29.3466 13.4267 29.3466 14.8267V17.1733C29.3466 18.56 28.2133 19.7067 26.8133 19.7067C24.4 19.7067 23.4133 21.4133 24.6266 23.5067C25.32 24.72 24.9066 26.2667 23.6933 26.96L21.3866 28.28C20.3333 28.9067 18.9733 28.5333 18.3466 27.48L18.2 27.2267C17 25.1333 15.0266 25.1333 13.8133 27.2267L13.6666 27.48C13.04 28.5333 11.68 28.9067 10.6266 28.28L8.31996 26.96C7.10663 26.2667 6.69329 24.7067 7.38663 23.5067C8.59996 21.4133 7.61329 19.7067 5.19996 19.7067C3.79996 19.7067 2.66663 18.56 2.66663 17.1733Z"
                fill="#49A6AF"
              />
              <path
                d="M16 20.3333C18.3932 20.3333 20.3333 18.3932 20.3333 16C20.3333 13.6067 18.3932 11.6666 16 11.6666C13.6067 11.6666 11.6666 13.6067 11.6666 16C11.6666 18.3932 13.6067 20.3333 16 20.3333Z"
                fill="#49A6AF"
              />
            </svg>
          </div>
        </div>
        <div className={styles.profileContainer}>
          <div className={styles.profileInfo}>
            <div className={styles.profileAvatar}>
              <img src={defaultAvatar} alt="Profile" />
            </div>
            <div className={styles.profileText}>
              <h3 className={styles.profileName}>{user.name}</h3>
              <p className={styles.profileRole}>Product manager</p>
            </div>
          </div>
          <button type="button" className={styles.dropdownButton}>
            <Icon name="chevron down" />
          </button>
        </div>
      </div>
    </div>
  );
});

DashboardHeader.propTypes = {
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default DashboardHeader;
