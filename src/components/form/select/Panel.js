import * as React from 'react';
import some from 'lodash/some';
import get from 'lodash/get';
import { ElevatedPanelWrapper } from './styles';
import { withListKeyConsumer } from '../../core/collection/list-key-manager';

class Panel extends React.Component {
  componentDidMount() {
    if (this.LIST) {
      this.LIST.addEventListener('focus-tab-out', this.props.onTabOut);
    }
  }
  
  componentWillUnmount() {
    if (this.LIST) {
      this.LIST.removeEventListener('focus-tab-out', this.props.onTabOut);
    }
  }
  
  getRef = (list) => {
    this.LIST = list;
    this.props.__setListContainerRef(list);
  };
  
  /*
  This function applies the selected prop to Option elements
   */
  applySelectedToOption = (option, index) => React.cloneElement(option, {
    hasFocus: this.props.__focused === index,
    selected: this.props.multiple ?
      this.props.selection.indexOf(option.props.value) > -1 :
      this.props.selection === option.props.value,
  });
  
  /*
  Since we have OptGroups as possible children, then we must iterate over OptGroup children
  and apply this.applySelectedToOption rather than over this.props.children
   */
  applySelectedToChildren = (c) => {
    const children = React.Children.toArray(c);
    if (some(children, child => get(child, 'props.__SUI_INTERNAL_TYPE') === 'OptGroup')) {
      return React.Children.map(c, (child, groupIndex) => {
        // we have to take into consideration the previous count before
        const previousGroupLength = get(c, [groupIndex - 1, 'props', 'children', 'length'], 0);
        return React.cloneElement(child, {
          children: React.Children.map(child.props.children, (optionChild, optionIndex) => (
            this.applySelectedToOption(optionChild, previousGroupLength + optionIndex)
          )),
        })
      });
    }
    
    return React.Children.map(c, this.applySelectedToOption);
  };
  
  render() {
    return (
      <ElevatedPanelWrapper
        data-sui-role={'panel'}
        innerRef={this.getRef}
      >
        { this.applySelectedToChildren(this.props.children) }
      </ElevatedPanelWrapper>
    )
  }
}

export default withListKeyConsumer(Panel);
