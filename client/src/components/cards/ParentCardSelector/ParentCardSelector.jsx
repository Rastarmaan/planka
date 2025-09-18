import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'semantic-ui-react';

const ParentCardSelector = React.memo(({ value, availableCards, onSelect }) => {
  const [t] = useTranslation();

  const handleChange = useCallback(
    (_, { value: nextValue }) => {
      onSelect(nextValue || null);
    },
    [onSelect],
  );

  const options = [
    {
      key: 'none',
      value: null,
      text: t('common.noParentCard'),
    },
    ...availableCards.map((card) => ({
      key: card.id,
      value: card.id,
      text: card.name,
    })),
  ];

  return (
    <Dropdown
      selection
      clearable
      placeholder={t('common.selectParentCard')}
      value={value}
      options={options}
      onChange={handleChange}
    />
  );
});

ParentCardSelector.propTypes = {
  value: PropTypes.string.isRequired,
  availableCards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ParentCardSelector;
