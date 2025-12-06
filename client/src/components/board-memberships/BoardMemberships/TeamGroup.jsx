/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Button } from 'semantic-ui-react';
import { usePopup } from '../../../lib/popup';

import { BoardMembershipRoleIcons } from '../../../constants/Icons';
import TeamActionsStep from './TeamActionsStep';

import styles from './Group.module.scss';

const TeamGroup = React.memo(({ items, role }) => {
  const TeamActionsPopup = usePopup(TeamActionsStep);

  return (
    <div className={styles.wrapper}>
      <Icon name={BoardMembershipRoleIcons[role]} className={styles.icon} />
      {items.map((item) => (
        <span key={item.id} className={styles.user}>
          <TeamActionsPopup boardTeamId={item.id}>
            <Button
              circular
              icon="users"
              size="tiny"
              className={styles.teamButton}
              title={item.team?.name}
            />
          </TeamActionsPopup>
        </span>
      ))}
    </div>
  );
});

TeamGroup.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  role: PropTypes.string.isRequired,
};

export default TeamGroup;
