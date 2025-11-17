/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { connect } from 'react-redux';

import selectors from '../../selectors';
import CardsFilter from './CardsFilter';

const mapStateToProps = (state) => {
  const currentUserId = selectors.selectCurrentUserId(state);

  return {
    currentUserId,
  };
};

export default connect(mapStateToProps)(CardsFilter);
