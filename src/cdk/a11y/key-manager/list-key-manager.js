import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, TAB } from '../../keycodes/keys';

export const ListKeyManagerPropTypes = PropTypes.shape({
  activeItemIndex: PropTypes.number,
  activeItem: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.instanceOf(HTMLElement)]),
  setTabOutFn: PropTypes.func,
  setConfig: PropTypes.func,
  setSkipPredicateFn: PropTypes.func,
  setMatchViewValueFn: PropTypes.func,
  setItems: PropTypes.func,
  setActiveItem: PropTypes.func,
  onKeydown: PropTypes.func,
  setFirstItemActive: PropTypes.func,
  setLastItemActive: PropTypes.func,
  setNextItemActive: PropTypes.func,
  setPreviousItemActive: PropTypes.func,
  updateActiveItem: PropTypes.func,
  updateActiveItemIndex: PropTypes.func,
});

export const ListKeyManagerDefaultProps = {
  activeItemIndex: -1,
  activeItem: null,
  setTabOutFn: _.noop,
  setConfig: _.noop,
  setSkipPredicateFn: _.noop,
  setMatchViewValueFn: _.noop,
  setItems: _.noop,
  setActiveItem: _.noop,
  onKeydown: _.noop,
  setFirstItemActive: _.noop,
  setLastItemActive: _.noop,
  setNextItemActive: _.noop,
  setPreviousItemActive: _.noop,
  updateActiveItem: _.noop,
  updateActiveItemIndex: _.noop,
};

export const { Provider: ListKeyProvider, Consumer: ListKeyConsumer } = React.createContext(ListKeyManagerDefaultProps);

/**
 * Function that checks whether an item has a property that matches the *UPPERCASE* string
 * that comes from state.pressedLetters.
 *
 * Depending on if you pass
 *
 * @param item - iteratee from this.state.items
 * @param STRING - *UPPERCASE* string
 * @returns {boolean}
 */
function defaultMatchViewValue(item, STRING) {
  return _.get(item.props, 'viewValue', '').toUpperCase().trim().indexOf(STRING) === 0;
}

/**
 * This class manages keyboard events for selectable lists.
 *
 * Since React doesn't provide a similar Angular QueryList component, it's on
 * good faith that the query list that's set via setItems is a
 * homogeneous list of items (i.e., ALL elements are of the same
 * type, like <li>, divs that inherit from the same React component,
 * or whatever).
 */
export default class ListKeyManager extends React.Component {
  constructor() {
    super();
    
    this.state = {
      /** whether the active item will wrap to the other end of list
       * when there are no more items in the given direction. */
      wrap: true,
      /** Configures whether the key manager should be able to
       * move the selection vertically. */
      vertical: true,
      /** Configures the key manager to move the selection horizontally.
       * Passing in `null` will disable horizontal movement. */
      horizontal: 'ltr',
      /** Turns on typeahead mode which allows users to set the
       * active item by typing. */
      typeAhead: 200,
      skipPredicateFn: item => _.get(item.props, 'disabled', false),
      matchViewValue: defaultMatchViewValue,
      tabOutFn: _.noop,
      items: [], // Component[] or HTMLElement[]
      pressedLetters: [],
      provide: {
        /*
        All these props are provided by the KeyManager provider
         */
        activeItemIndex: -1,
        activeItem: null,
        setConfig: setConfig.bind(this),
        setTabOutFn: setPrivateState.bind(this, 'tabOutFn'),
        setSkipPredicateFn: setPrivateState.bind(this, 'skipPredicateFn'),
        setMatchViewValueFn: setPrivateState.bind(this, 'matchViewValue'),
        setItems: setPrivateState.bind(this, 'items'),
        setActiveItem: this.setActiveItem,
        onKeydown: this.onKeydown,
        setFirstItemActive: this.setFirstItemActive,
        setLastItemActive: this.setLastItemActive,
        setNextItemActive: this.setNextItemActive,
        setPreviousItemActive: this.setPreviousItemActive,
        updateActiveItem: this.updateActiveItem,
        updateActiveItemIndex: this.updateActiveItemIndex,
      }
    };
  }
  
  componentDidMount() {
    this.setTypeAhead();
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (this.state.pressedLetters.length > prevState.pressedLetters.length) {
      setActiveFromKeys.call(this);
    }
    
    if (prevState.typeAhead !== this.state.typeAhead) {
      this.setTypeAhead();
    }
  }
  
  /**
   * Turns on typeahead mode which allows users to set the active item by typing.
   */
  setTypeAhead = () => {
    const items = this.state.items;
    /*
    Todo: update throw error condition because we may pass HTMLElement items, which do not have .props
     */
    // if (items && _.some(items, item => !_.get(item.props, 'viewValue'))) {
    //   throw new Error('ListKeyManager items must have a `viewValue` prop.');
    // }
  
    this.purgeKeys = this.state.typeAhead ? _.debounce(clearKeys.bind(this), _.toNumber(this.state.typeAhead), { trailing: true }) : clearKeys.bind(this);
  };
  
  /*
  Sets the active item to the item at the index specified. (Or item)
   */
  setActiveItem = (item) => {
    this.updateActiveItem(item);
  };
  
  onKeydown = (event) => {
    const key = event.key;
  
    switch (key) {
      case TAB:
        this.state.tabOutFn();
        return;
    
      case ARROW_DOWN:
        if (this.state.vertical) {
          this.setNextItemActive();
          break;
        } else {
          return;
        }
    
      case ARROW_UP:
        if (this.state.vertical) {
          this.setPreviousItemActive();
          break;
        } else {
          return;
        }
    
      case ARROW_RIGHT:
        if (this.state.horizontal === 'ltr') {
          this.setNextItemActive();
          break;
        } else if (this.state.horizontal === 'rtl') {
          this.setPreviousItemActive();
          break;
        } else {
          // it's null, so disable navigation
          return;
        }
    
      case ARROW_LEFT:
        if (this.state.horizontal === 'ltr') {
          this.setPreviousItemActive();
          break;
        } else if (this.state.horizontal === 'rtl') {
          this.setNextItemActive();
          break;
        } else {
          // it's null, so disable navigation
          return;
        }
    
      default:
        // Attempt to use the `event.key` which also maps it to the user's keyboard language,
        // otherwise fall back to resolving alphanumeric characters via the keyCode.
        if (_.get(key, 'length', 1)) {
          addKey.call(this, event.key.toLocaleUpperCase());
        }
      
        // Note that we return here, in order to avoid preventing
        // the default action of non-navigational keys.
        return;
    }
  
    clearKeys.call(this);
    event.preventDefault();
  };
  
  /** Sets the active item to the first enabled item in the list. */
  setFirstItemActive = () => {
    setActiveItemByIndex.call(this, 0, 1);
  };
  
  /** Sets the active item to the last enabled item in the list. */
  setLastItemActive = () => {
    setActiveItemByIndex.call(this, this.state.items.length - 1, -1);
  };
  
  /** Sets the active item to the next enabled item in the list. */
  setNextItemActive = () => {
    this.state.provide.activeItemIndex < 0 ?
      this.setFirstItemActive() :
      setActiveItemByDelta.call(this, 1);
  };
  
  /** Sets the active item to a previous enabled item in the list. */
  setPreviousItemActive = () => {
    this.state.provide.activeItemIndex < 0 && this.state.wrap ?
      this.setLastItemActive() :
      setActiveItemByDelta.call(this, -1);
  };
  
  /** Allows setting the active without any other effects. */
  updateActiveItem = (item) => {
    const itemArray = _.toArray(this.state.items);
    const index = _.isNumber(item) ? item : itemArray.indexOf(item);
    
    this.setState(state => ({
      provide: {
        ...state.provide,
        activeItemIndex: index,
        activeItem: itemArray[index],
      },
    }));
  };
  
  /** Allows setting of the activeItemIndex without any other effects. */
  updateActiveItemIndex = (index) => {
    this.updateActiveItem(index);
  };
  
  render() {
    return (
      <ListKeyProvider value={this.state.provide}>
        { this.props.children }
      </ListKeyProvider>
    );
  }
}

/*
Remove props because, as this is a component development kit,
child components using these managers should be able to
manage their own state.
 */

/**
 * Higher order component to wrap the list key provider
 */
export function withListKeyProvider(Component) {
  function WithListKeyProvider(props) {
    return (
      <ListKeyManager>
        <Component {...props} />
      </ListKeyManager>
    );
  }
  
  WithListKeyProvider.displayName = `WithListKeyProvider${Component.displayName}`;
  
  return WithListKeyProvider;
}

/*
Higher order component to wrap whatever child Component in a list key consumer
 */
export function withListKeyConsumer(Component) {
  function WithListKeyConsumer(props) {
    return (
      <ListKeyConsumer>
        { context => <Component {...props} __keyManager={context} /> }
      </ListKeyConsumer>
    );
  }
  
  WithListKeyConsumer.displayName = `WithListKeyConsumer(${Component.displayName})`;
  
  return WithListKeyConsumer;
}

/*
Private methods
 */

/**
 * Set the configuration, namely the wrap, typeAhead, vertical, and horizontal
 * parts of state
 */
function setConfig({ wrap, vertical, horizontal, typeAhead }) {
  this.setState({ wrap, vertical, horizontal, typeAhead });
}

/**
 * Set private state (i.e., things that are not exposed in this.state.provide)
 */
function setPrivateState(key, value) {
  this.setState({ [key]: value });
}

/*
Add key to list of pressed keys. Automatically invoke purgeKeys after
this.state.typeAhead ms
 */
function addKey(key) {
  this.setState(state => ({
    pressedLetters: [...state.pressedLetters, key],
  }), () => {
    /*
    invoked with a debounce on the trailing edge, so will do it whenever
    all of the events end.
     */
    _.invoke(this.purgeKeys, 'cancel');
    this.purgeKeys();
  });
}

/*
Clear keys synchronously
 */
function clearKeys() {
  this.setState({ pressedLetters: [] });
}

/**
 * This method sets the active item, given a list of items and the delta between the
 * currently active item and the new active item. It will calculate differently
 * depending on whether wrap mode is turned on.
 */
function setActiveItemByDelta(delta) {
  this.state.wrap ?
    setActiveInWrapMode.call(this, delta) :
    setActiveInDefaultMode.call(this, delta);
}

/**
 * Sets the active item properly given "wrap" mode. In other words, it will continue to move
 * down the list until it finds an item that is not disabled, and it will wrap if it
 * encounters either end of the list.
 */
function setActiveInWrapMode(delta) {
  const items = this.state.items;
  
  for (let i = 1; i <= items.length; i++) {
    const index = (this.state.provide.activeItemIndex + (delta * i) + items.length) % items.length;
    const item = items[index];
  
    if (!this.state.skipPredicateFn(item)) {
      this.setActiveItem(index);
      return;
    }
  }
}

/**
 * Sets the active item properly given the default mode. In other words, it will
 * continue to move down the list until it finds an item that is not disabled. If
 * it encounters either end of the list, it will stop and not wrap.
 */
function setActiveInDefaultMode(delta) {
  setActiveItemByIndex.call(this, this.state.provide.activeItemIndex + delta, delta);
}

/**
 * Sets the active item to the first enabled item starting at the index specified. If the
 * item is disabled, it will move in the fallbackDelta direction until it either
 * finds an enabled item or encounters the end of the list.
 */
function setActiveItemByIndex(index, fallbackDelta) {
  const items = this.state.items;
  if (!_.get(items, index)) return;
  
  while (this.state.skipPredicateFn(items[index])) {
    index += fallbackDelta;
    if (!_.get(items, index)) return;
  }
  
  this.setActiveItem(index);
}

/**
 * Sets the current active child from the list of keys that are given
 */
function setActiveFromKeys() {
  if (this.state.pressedLetters.length === 0) return;
  const string = this.state.pressedLetters.join('');
  
  const items = this.state.items;
  
  for (let i = 1; i < items.length + 1; i++) {
    const index = (this.state.provide.activeItemIndex + i) % items.length;
    const item = items[index];
    
    if (!this.state.skipPredicateFn(item) && this.state.matchViewValue(item, string)) {
      
      this.setActiveItem(index);
      break;
    }
  }
  
  this.purgeKeys();
}
