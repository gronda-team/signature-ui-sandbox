import get from 'lodash/get';
import includes from 'lodash/includes';

/*
This counts the number of option group labels that offset the actual index
number of the selected item from the group
 */
export default function countGroupLabels(index, options, optionGroups) {
  if (optionGroups.length) {
    const optionValues = options.map(option => get(option, 'props.value'));
    const optionGroupValues = optionGroups.map(group => (
      group.props.children.map(child => get(child, 'props.value'))
    ));
    
    let groupCounter = 0;
    for (let i = 0; i < index + 1; i++) {
      if (
        optionValues[i]
        && includes(get(optionGroupValues, groupCounter), optionValues[i])
      ) {
        groupCounter += 1;
      }
    }
    
    return groupCounter;
  }
  
  return 0;
}