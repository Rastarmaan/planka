/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Icon } from 'semantic-ui-react';

import styles from './WorkspaceSelector.module.scss';

const WorkspaceSelector = React.memo(
  ({
    workspaces,
    selectedWorkspace,
    showWorkspacePopup,
    workspacePopupRef,
    onTogglePopup,
    onSelectWorkspace,
    onRenameWorkspace,
    onDeleteWorkspace,
    onCreateWorkspace,
  }) => {
    const [t] = useTranslation();
    const currentWorkspace = workspaces.find((w) => w.value === selectedWorkspace);

    return (
      <div className={styles.workspaceSelector} ref={workspacePopupRef}>
        <div
          role="button"
          tabIndex={0}
          className={styles.selectedWorkspace}
          onClick={onTogglePopup}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTogglePopup();
            }
          }}
        >
          <div className={styles.workspaceInfo}>
            <div className={styles.workspaceName}>{currentWorkspace?.text}</div>
            <div className={styles.workspaceDescription}>{currentWorkspace?.description}</div>
          </div>
          <div className={styles.workspaceArrows}>
            <Icon name="angle up" />
            <Icon name="angle down" />
          </div>
        </div>

        {showWorkspacePopup && (
          <div className={styles.workspacePopup}>
            <div className={styles.workspacePopupItem}>
              <Icon name="check" className={styles.workspaceCheckIcon} />
              <div className={styles.workspaceInfo}>
                <div className={styles.workspaceName}>{currentWorkspace?.text}</div>
                <div className={styles.workspaceDescription}>{currentWorkspace?.description}</div>
              </div>
            </div>

            {workspaces
              .filter((w) => w.value !== selectedWorkspace)
              .map((workspace) => (
                <div
                  key={workspace.key}
                  role="button"
                  tabIndex={0}
                  className={styles.workspacePopupItem}
                  onClick={() => onSelectWorkspace(workspace.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectWorkspace(workspace.value);
                    }
                  }}
                >
                  <div className={styles.workspaceInfo}>
                    <div className={styles.workspaceName}>{workspace.text}</div>
                    <div className={styles.workspaceDescription}>{workspace.description}</div>
                  </div>
                  <Dropdown
                    trigger={
                      <Button className={styles.manageButtonSmall}>
                        Manage
                        <Icon name="angle down" />
                      </Button>
                    }
                    icon={null}
                    direction="left"
                    className={styles.manageDropdownInline}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={(e) => onRenameWorkspace(e, workspace)}>
                        <Icon name="pencil" />
                        Rename
                      </Dropdown.Item>
                      <Dropdown.Item onClick={(e) => onDeleteWorkspace(e, workspace)}>
                        <Icon name="trash alternate" />
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              ))}

            <div className={styles.workspacePopupSeparator} />

            <Button className={styles.createWorkspaceButton} onClick={onCreateWorkspace}>
              <Icon name="plus" />
              {t('documentManagement.createNewWorkspace')}
            </Button>
          </div>
        )}
      </div>
    );
  },
);

WorkspaceSelector.propTypes = {
  workspaces: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      description: PropTypes.string,
    }),
  ).isRequired,
  selectedWorkspace: PropTypes.string.isRequired,
  showWorkspacePopup: PropTypes.bool.isRequired,
  workspacePopupRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
  onTogglePopup: PropTypes.func.isRequired,
  onSelectWorkspace: PropTypes.func.isRequired,
  onRenameWorkspace: PropTypes.func.isRequired,
  onDeleteWorkspace: PropTypes.func.isRequired,
  onCreateWorkspace: PropTypes.func.isRequired,
};

export default WorkspaceSelector;
