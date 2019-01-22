import _ from 'lodash';
/**
 * Counts the amount of option group labels that precede the specified option.
 * @param optionIndex Index of the option at which to start counting.
 * @param options Flat array of all of the options.
 * @param optionGroups Flat array of all of the option groups.
 */
export function countGroupLabelsBeforeOption(optionIndex, options, optionGroups) {
  if (optionGroups.length) {
    let groupCounter = 0;
    
    for (let i = 0; i < optionIndex + 1; i++) {
      if (_.get(options, [i, 'props', 'group']) === _.get(optionGroups, [groupCounter, 'props', 'label'])) {
        groupCounter++;
      }
    }
    
    return groupCounter;
  }
  
  return 0;
}

/**
 * Determines the position to which to scroll a panel in order for an option to be into view.
 * @param optionIndex Index of the option to be scrolled into the view.
 * @param optionHeight Height of the options.
 * @param currentScrollPosition Current scroll position of the panel.
 * @param panelHeight Height of the panel.
 */
export function getOptionScrollPosition(optionIndex, optionHeight, currentScrollPosition, panelHeight) {
  const optionOffset = optionIndex * optionHeight;
  
  if (optionOffset < currentScrollPosition) return optionOffset;
  if (optionOffset + optionHeight > currentScrollPosition + panelHeight) {
    return Math.max(0, optionOffset - panelHeight + optionHeight);
  }
  
  return currentScrollPosition;
}
