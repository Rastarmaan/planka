import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, Icon } from 'semantic-ui-react';

import actions from '../../../actions';
import selectors from '../../../selectors';

import styles from './ReleaseStep.module.scss';

const ReleaseStep = React.memo(({ cardId, boardId }) => {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const releases = useSelector((state) =>
    state.orm.boardRelease
      .all()
      .filter((r) => r.boardId === boardId)
      .toRefArray(),
  );

  const cardReleases = useSelector((state) => selectors.selectReleasesForCard(state, cardId));

  const currentRelease = useMemo(() => {
    return cardReleases && cardReleases.length > 0 ? cardReleases[0] : null;
  }, [cardReleases]);

  const handleSelectRelease = useCallback(
    (e, { value }) => {
      if (value) {
        dispatch(actions.releaseCardAdd(value, cardId));
      }
    },
    [cardId, dispatch],
  );

  const handleRemoveRelease = useCallback(() => {
    if (currentRelease) {
      dispatch(actions.releaseCardRemove(currentRelease.id, cardId));
    }
  }, [cardId, currentRelease, dispatch]);

  const releaseOptions = releases.map((release) => ({
    key: release.id,
    value: release.id,
    text: `${release.version} - ${release.name}`,
    content: (
      <div>
        <strong>{release.version}</strong>
        {' - '}
        {release.name}
        {release.target && (
          <div style={{ fontSize: '0.9em', color: '#666', marginTop: '2px' }}>{release.target}</div>
        )}
        {release.reviewResult && (
          <div style={{ fontSize: '0.85em', color: '#888', marginTop: '2px', fontStyle: 'italic' }}>
            {release.reviewResult}
          </div>
        )}
      </div>
    ),
  }));

  return (
    <div className={styles.wrapper}>
      {currentRelease ? (
        <>
          <div className={styles.currentRelease}>
            <Icon name="flag checkered" />
            <div className={styles.releaseInfo}>
              <div className={styles.releaseVersion}>{currentRelease.version}</div>
              <div className={styles.releaseName}>{currentRelease.name}</div>
              {currentRelease.target && (
                <div className={styles.releaseTarget}>{currentRelease.target}</div>
              )}
              {currentRelease.reviewResult && (
                <div className={styles.releaseReviewResult}>{currentRelease.reviewResult}</div>
              )}
            </div>
          </div>
          <div className={styles.actions}>
            <Button size="small" basic color="red" onClick={handleRemoveRelease}>
              <Icon name="delete" />
              {t('action.removeFromRelease')}
            </Button>
          </div>
        </>
      ) : (
        <div className={styles.selector}>
          <div className={styles.label}>{t('action.addRelease')}</div>
          <Dropdown
            fluid
            selection
            search
            options={releaseOptions}
            placeholder={t('action.selectRelease')}
            onChange={handleSelectRelease}
            className={styles.dropdown}
          />
        </div>
      )}
    </div>
  );
});

ReleaseStep.propTypes = {
  cardId: PropTypes.string.isRequired,
  boardId: PropTypes.string.isRequired,
};

export default ReleaseStep;
