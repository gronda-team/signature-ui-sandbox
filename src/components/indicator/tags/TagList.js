import React from 'react';
import PropTypes from 'prop-types';
import isFunction from 'lodash/isFunction';
import { TagListWrapper } from './styles';
import withSelection from '../../core/collection/selection';
import { withListKeyConsumer, withListKeyProvider } from '../../core/collection/list-key-manager';
import { PROP_TYPE_STRING_OR_NUMBER } from '../../core/prop-types';

class TagList extends React.Component {
  constructor() {
    super();
    this.state = { tabIndex: 0 };
  }
  
  componentDidMount() {
    if (this.LIST) {
      this.LIST.addEventListener('focus-tab-out', this.onTabOut);
    }
  }
  
  componentWillUnmount() {
    if (this.LIST) {
      this.LIST.removeEventListener('focus-tab-out', this.onTabOut);
    }
  }
  
  getRef = (list) => {
    this.LIST = list;
    this.props.__setListContainerRef(list);
  };
  
  onSelect = (value) => () => {
    this.props.select(value);
  };
  
  onDeselect = (value) => () => {
    this.props.deselect(value);
  };
  
  onRemove = (childProps, index) => () => {
    this.props.deselect(childProps.value);
    
    // handle focus
    if (this.props.__focused === index) {
      this.handleFocusOfRemovedChild();
    }
    
    if (isFunction(childProps.onRemove)) {
      childProps.onRemove();
    }
  };
  
  handleFocusOfRemovedChild = () => {
    const count = React.Children.count(this.props.children);
    if (this.props.__focused < count - 1) {
      // check if we're in the middle of the list
      this.props.__onSetActiveIndex(this.props.__focused);
    } else if (this.props.__focused - 1 >= 0) {
      // else if we're in the last item (and the index is valid)
      this.props.__onSetActiveIndex(this.props.__focused - 1);
    }
  };
  
  onTabOut = () => {
    /*
    When we tab out of the list, we don't want the list to recapture the focus event
    and focus Tag again (this is because tabIndex = 0, which means that it's tabbable by the
    browser).
    
    So we set the tabIndex to -1 (so that the list isn't focusable via tab anymore)
    and then we immediately set it back to whatever tabIndex value it was before.
     */
    this.setState({ tabIndex: -1 }, () => {
      window.setTimeout(() => {
        this.setState({ tabIndex: 0 });
      });
    });
  };
  
  render() {
    return (
      <TagListWrapper
        tabIndex={this.state.tabIndex}
        innerRef={this.getRef}
        onKeyDown={this.props.__onKeyDown}
        onFocus={this.props.__onWrapperFocus}
        onBlur={this.props.__onWrapperBlur}
        onFocusCapture={this.props.__onFocusCapture}
        onBlurCapture={this.props.__onBlurCapture}
        role={React.Children.count(this.props.children) === 0 ? null : 'listbox'}
        aria-multiselectable={this.props.multiple}
        aria-disabled={this.props.disabled}
      >
        { React.Children.map(this.props.children, (child, index) => React.cloneElement(child, {
          hasFocus: this.props.__focused === index,
          disabled: this.props.disabled,
          onSelect: this.onSelect(child.props.value),
          onDeselect: this.onDeselect(child.props.value),
          onRemove: this.onRemove(child.props, index),
          selected: this.props.multiple ?
            this.props.selection.indexOf(child.props.value) > -1 :
            this.props.selection === child.props.value,
        })) }
      </TagListWrapper>
    )
  }
}

TagList.propTypes = {
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  disabled: PropTypes.bool,
  multiple: PropTypes.bool,
  select: PropTypes.func,
  deselect: PropTypes.func,
  toggle: PropTypes.func,
  clear: PropTypes.func,
  selection: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
    PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  ]),
  __focused: PropTypes.number,
  __onSetActiveIndex: PropTypes.func,
  __setListContainerRef: PropTypes.func,
  __onKeyDown: PropTypes.func,
  __onFocusCapture: PropTypes.func,
  __onBlurCapture: PropTypes.func,
  __onWrapperFocus: PropTypes.func,
  __onWrapperBlur: PropTypes.func,
};

TagList.defaultProps = {
  orientation: 'horizontal',
  disabled: false,
  multiple: false,
  select: () => {},
  deselect: () => {},
  toggle: () => {},
  clear: () => {},
  selection: null,
  // context
  __focused: -1,
  __onSetActiveIndex: () => {},
  __setListContainerRef: () => {},
  __onKeyDown: () => {},
  __onFocusCapture: () => {},
  __onBlurCapture: () => {},
  __onWrapperFocus: () => {},
  __onWrapperBlur: () => {},
};

const TL = withSelection(withListKeyProvider(withListKeyConsumer(TagList)));

TL.propTypes = {
  vertical: PropTypes.bool, // whether or not pressing up or down is prev/next
  horizontal: PropTypes.bool, // whether or not pressing left or right is prev/next
  typeAhead: PropTypes.bool, // whether or not you can type and hit the active guy
  wrap: PropTypes.bool, // go from end of list to beginning of list when tabbing
  onFocusChange: PropTypes.func,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  disabled: PropTypes.bool,
  multiple: PropTypes.bool,
  select: PropTypes.func,
  deselect: PropTypes.func,
  toggle: PropTypes.func,
  clear: PropTypes.func,
  selection: PropTypes.oneOfType([
    PropTypes.arrayOf(PROP_TYPE_STRING_OR_NUMBER),
    PROP_TYPE_STRING_OR_NUMBER,
  ]),
};

TL.defaultProps = {
  vertical: true,
  typeAhead: true,
  horizontal: true,
  wrap: true,
};

export default TL;
