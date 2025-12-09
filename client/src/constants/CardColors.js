export const CARD_COLORS = [
  { key: 'light-grey', name: 'Light Grey', color: '#E8E8E8' },
  { key: 'light-blue', name: 'Light Blue', color: '#A8D5E5' },
  { key: 'light-green', name: 'Light Green', color: '#B8E6C3' },
  { key: 'light-yellow', name: 'Light Yellow', color: '#FFF4A3' },
  { key: 'light-orange', name: 'Light Orange', color: '#FFD6A5' },
  { key: 'light-red', name: 'Light Red', color: '#FFB3BA' },
  { key: 'light-purple', name: 'Light Purple', color: '#D5B3E5' },
  { key: 'light-pink', name: 'Light Pink', color: '#FFC8DD' },
  { key: 'medium-grey', name: 'Medium Grey', color: '#B8B8B8' },
  { key: 'medium-blue', name: 'Medium Blue', color: '#6FB3D2' },
  { key: 'medium-green', name: 'Medium Green', color: '#81C995' },
  { key: 'medium-yellow', name: 'Medium Yellow', color: '#FFE66D' },
  { key: 'medium-orange', name: 'Medium Orange', color: '#FFB347' },
  { key: 'medium-red', name: 'Medium Red', color: '#FF9AA2' },
  { key: 'medium-purple', name: 'Medium Purple', color: '#B39CD0' },
  { key: 'medium-pink', name: 'Medium Pink', color: '#FFB3C6' },
];

export const getCardColorHex = (colorKey) => {
  const colorObj = CARD_COLORS.find((c) => c.key === colorKey);
  return colorObj ? colorObj.color : null;
};

export default {
  CARD_COLORS,
  getCardColorHex,
};
