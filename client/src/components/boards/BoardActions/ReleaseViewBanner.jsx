/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import { releaseSnapshotViewClear } from '../../../actions/board-releases';

import styles from './ReleaseViewBanner.module.scss';

const ReleaseViewBanner = React.memo(() => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const viewingReleaseId = useSelector(selectors.selectViewingReleaseId);
  const releases = useSelector(selectors.selectBoardReleasesForCurrentBoard);

  const handleExitView = useCallback(() => {
    dispatch(releaseSnapshotViewClear());
  }, [dispatch]);

  if (!viewingReleaseId) {
    return null;
  }

  const viewingRelease = releases.find((release) => release.id === viewingReleaseId);

  if (!viewingRelease) {
    return null;
  }

  return (
    <div className={styles.banner}>
      <Icon name="eye" className={styles.icon} />
      <span className={styles.text}>
        {t('common.viewingRelease', {
          version: viewingRelease.version,
          name: viewingRelease.name,
        })}
      </span>
      <button type="button" className={styles.exitButton} onClick={handleExitView}>
        <Icon name="close" className={styles.buttonIcon} />
        <span className={styles.buttonText}>{t('action.exitReleaseView')}</span>
      </button>
    </div>
  );
});

export default ReleaseViewBanner;
