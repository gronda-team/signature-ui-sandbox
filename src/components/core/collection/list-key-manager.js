import * as React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import has from 'lodash/has';
import findIndex from 'lodash/findIndex';
import invoke from 'lodash/invoke';
import isFunction from 'lodash/isFunction';
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, TAB } from '../keys';

export const { Provider: ListKeyProvider, Consumer: ListKeyConsumer } = React.createContext({
  __onSetActiveIndex: () => {},
  __setListContainerRef: () => {},
  __onKeyDown: () => {},
  __onFocusCapture: () => {},
  __onBlurCapture: () => {},
  __onWrapperFocus: () => {},
  __onWrapperBlur: () => {},
  __focused: -1,
  __listContainerRef: null,
});

export function skipChild(child) {
  return invoke(child, 'getAttribute', 'aria-disabled') === 'true';
}

export function getSelectedChild(child) {
  return invoke(child, 'getAttribute', 'aria-selected') === 'true';
}

export default class ListKeyManager extends React.Component {
  constructor() {
    super();
    this.state = {
      __focused: -1,
      __listContainerRef: null,
      __keys: [],
      __onSetFirstItemActive: this.onSetFirstItemActive,
      __onSetLastItemActive: this.onSetLastItemActive,
      __onSetActiveIndex: this.onSetActiveIndex,
      __setListContainerRef: this.setListContainerRef,
      __onKeyDown: this.onKeyDown,
      __onFocusCapture: this.onFocusCapture,
      __onBlurCapture: this.onBlurCapture,
      __onWrapperFocus: this.onWrapperFocus,
      __onWrapperBlur: this.onWrapperBlur,
    };
  
    this.purgeKeys = debounce(this.clearKeys, 200, { trailing: true });
    this.parseKeys = debounce(this.onSetActiveFromKeys, 200, { trailing: true });
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (this.state.__keys.length > prevState.__keys.length) {
      this.parseKeys.cancel();
      this.parseKeys();
    }
  }
  
  setListContainerRef = (list) => {
    this.LIST = list;
    if (list) {
      this.setState({ __listContainerRef: list });
    }
  };
  
  getOptions = () => (
    !!this.LIST ?
      this.LIST.querySelectorAll('[role="option"]') :
      []
  );
  
  onKeyDown = (event) => {
    const { key } = event;
    switch (key) {
      case TAB:
        if (this.LIST) {
          // dispatch custom event
          this.LIST.dispatchEvent(new Event('focus-tab-out'));
        }
        return;
      case ARROW_DOWN:
        if (this.props.vertical) {
          this.onSetNextItemActive();
          break;
        } else {
          return;
        }
      case ARROW_UP:
        if (this.props.vertical) {
          this.onSetPreviousItemActive();
          break;
        } else {
          return;
        }
      case ARROW_RIGHT:
        if (this.props.horizontal) {
          this.onSetNextItemActive();
          break;
        } else {
          return;
        }
      case ARROW_LEFT:
        if (this.props.horizontal) {
          this.onSetPreviousItemActive();
          break;
        } else {
          return;
        }
      default:
        if (get(key, 'length', 0) === 1) {
          this.addKey(key.toLocaleUpperCase());
        }
        
        return;
    }
    
    event.preventDefault(); // if it makes it this far, then prevent default behavior
    this.clearKeys();
  };
  
  addKey = (key) => {
    this.setState(state => ({
      __keys: [...state.__keys, key],
    }), () => {
      /*
      invoked with a debounce on the trailing edge, so will do it whenever
      all of the events end.
       */
      this.purgeKeys.cancel();
      this.purgeKeys();
    })
  };
  
  onFocusCapture = (event) => {
    this.onSetActiveIndex(findIndex(this.getOptions(), event.target));
  };
  
  onBlurCapture = () => {
    this.onSetActiveIndex(-1);
  };
  
  onWrapperFocus = (event) => {
    // if the event target is a NOT a Tag
    // e.g., by tabbing in, or by clicking on the wrapper but not a Tag
    if (findIndex(this.getOptions(), event.target) === -1) {
      // then find the first selected one, or default to the first Tag
      const selectedIndex = findIndex(this.getOptions(), getSelectedChild);
      this.onSetActiveIndex(selectedIndex > -1 ? selectedIndex : 0);
    }
  };
  
  onWrapperBlur = (event) => {
    // no op
  };
  
  clearKeys = () => {
    this.setState({ __keys: [] });
  };
  
  onSetActiveIndex = (index) => {
    this.setState({ __focused: index }, () => {
      if (isFunction(this.props.onFocusChange)) {
        this.props.onFocusChange(index);
      }
    });
  };
  
  onSetFirstItemActive = () => {
    this.onSetActiveByIndex(0, 1);
  };
  
  onSetLastItemActive = () => {
    this.onSetActiveByIndex(this.getOptions().length - 1, -1);
  };
  
  onSetNextItemActive = () => {
    this.state.__focused < 0 ? this.onSetFirstItemActive() : this.onSetActiveItemByDelta(1);
  };
  
  onSetPreviousItemActive = () => {
    this.state.__focused < 0 && this.props.wrap ? this.onSetLastItemActive() : this.onSetActiveItemByDelta(-1);
  };
  
  onSetActiveItemByDelta = (delta = 1) => {
    this.props.wrap ? this.onSetActiveInWrapMode(delta) : this.onSetActiveInDefaultMode(delta);
  };
  
  onSetActiveInWrapMode = (delta = 1) => {
    const items = this.getOptions();
    const { __focused } = this.state;
    for (let i = 1; i <= items.length; i++) {
      const newIndex = (__focused + (delta * i) + items.length) % items.length;
      const item = items[newIndex];
      
      if (!skipChild(item)) {
        this.onSetActiveIndex(newIndex);
        return;
      }
    }
  };
  
  onSetActiveInDefaultMode = (delta) => {
    this.onSetActiveByIndex(this.state.__focused + delta, delta);
  };
  
  onSetActiveByIndex = (index, fallback = 1) => {
    const items = this.getOptions();
    if (!has(items, index)) return;
    let newIndex = index;
    
    while (skipChild(items[newIndex])) {
      newIndex += fallback;
      if (!has(items, index)) return;
    }
    
    this.onSetActiveIndex(newIndex);
  };
  
  onSetActiveFromKeys = () => {
    if (!this.props.typeAhead || this.state.__keys.length === 0) return;
    const string = this.state.__keys.join('');
    
    const items = this.getOptions();
    
    for (let i = 1; i < items.length + 1; i++) {
      const index = (this.state.__focused + i) % items.length;
      const item = items[index];
      
      if (!skipChild(item) && item.getAttribute('aria-label').toUpperCase().trim().indexOf(string) === 0) {
        
        this.onSetActiveIndex(index);
        break;
      }
    }
    
    this.purgeKeys();
  };
  
  render() {
    return (
      <ListKeyProvider value={this.state}>
        { this.props.children }
      </ListKeyProvider>
    )
  }
}

ListKeyManager.propTypes = {
  vertical: PropTypes.bool, // whether or not pressing up or down is prev/next
  horizontal: PropTypes.bool, // whether or not pressing left or right is prev/next
  typeAhead: PropTypes.bool, // whether or not you can type and hit the active guy
  wrap: PropTypes.bool, // go from end of list to beginning of list when tabbing
  onFocusChange: PropTypes.func,
};

ListKeyManager.defaultProps = {
  vertical: true,
  typeAhead: true,
  horizontal: true,
  wrap: true,
};

export const withListKeyProvider = Component => props => {
  const { vertical, horizontal, typeAhead, wrap, onFocusChange, ...restProps } = props;
  return (
    <ListKeyManager vertical={vertical} horizontal={horizontal} onFocusChange={onFocusChange} typeAhead={typeAhead} wrap={wrap}>
      <Component {...restProps} />
    </ListKeyManager>
  )
};

export const withListKeyConsumer = Component => props => (
  <ListKeyConsumer>
    { context => {
      const { __keys, ...restContext } = context;
      return (
        <Component {...props} {...restContext} />
      );
    } }
  </ListKeyConsumer>
);