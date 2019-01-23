import * as React from 'react';
import _ from 'lodash';
import {ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, DOWN, LEFT, RIGHT, TAB, UP} from '../../keycodes/keys';
import { ListKeyConsumer, ListKeyProvider } from './context/ListKeyManagerContext';

// Aliases
const count = React.Children.count;
const toArray = React.Children.toArray;

/**
 * Function that obtains a label or view value from a React
 * component.
 *
 * @param item - iteratee from this.state.items
 * @returns {boolean}
 */
function defaultGetLabel(item) {
  return _.get(item.props, 'viewValue', '');
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
      /**
       * Predicate function that can be used to check whether an item should be skipped
       * by the key manager. By default, disabled items are skipped.
       */
      skipPredicateFn: item => _.get(item.props, 'disabled', false),
      /** Gets the label for this option. */
      getLabel: defaultGetLabel,
      /**
       * Callback that is called when the TAB key is pressed, so components can react
       * when focus is shifted off of the list.
       */
      tabOutFn: _.noop,
      /** QueryList equivalent for React */
      items: [],
      // Buffer for the letters that the user has pressed when the typeahead option is turned on.
      pressedLetters: [],
      /** Callback that runs when the active item changes */
      onChange: _.noop,
      /**
       * Modifier keys which are allowed to be held down and whose default actions will be prevented
       * as the user is pressing the arrow keys. Defaults to not allowing any modifier keys.
       */
      allowedModifierKeys: [],
      provide: {
        /** All these props are provided by the KeyManager provider */
        activeItemIndex: -1,
        activeItem: null,
        setActiveItem: this.setActiveItem,
        onKeyDown: this.onKeyDown,
        setConfig: setConfig.bind(this),
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
    this.setTypeAhead(this.state.typeAhead);
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (prevState.typeAhead !== this.state.typeAhead) {
      this.setTypeAhead(this.state.typeAhead);
    }

    if (count(prevState.items) !== count(this.state.items)) {
      updateActiveItemOnItemsChange.call(this, this.state.items);
    } else {
      const toItemLabel = this.state.getLabel;
      if (!_.isEqual(prevState.items.map(toItemLabel), this.state.items.map(toItemLabel))) {
        updateActiveItemOnItemsChange.call(this, this.state.items);
      }
    }
  }
  
  /**
   * Turns on typeahead mode which allows users to set the active item by typing.
   */
  setTypeAhead = (debounceInterval = 200) => {
    const typeAhead = _.toNumber(debounceInterval);
    this.getStringFromKeys = typeAhead > 0 ?
      _.debounce(getStringFromKeys.bind(this), typeAhead, { trailing: true }) :
      getStringFromKeys.bind(this);
  };
  
  /*
  Sets the active item to the item at the index specified. (Or item)
   */
  setActiveItem = (item) => {
    this.updateActiveItem(item);
  };

  onKeyDown = (event) => {
    const key = event.key;
    const modifiers = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'];
    const isModifierAllowed = _.every(modifiers, modifier => (
      // if modifier key wasn't pressed, or it was, and we allowed it
      !event[modifier] || this.state.allowedModifierKeys.indexOf(modifier) > -1
    ));
  
    switch (key) {
      case TAB:
        this.state.tabOutFn();
        return;
    
      case ARROW_DOWN:
      case DOWN:
        if (this.state.vertical && isModifierAllowed) {
          this.setNextItemActive();
          break;
        } else return;
    
      case ARROW_UP:
      case UP:
        if (this.state.vertical && isModifierAllowed) {
          this.setPreviousItemActive();
          break;
        } else return;
    
      case ARROW_RIGHT:
      case RIGHT:
        if (this.state.horizontal && isModifierAllowed) {
          this.state.horizontal === 'rtl' ?
            this.setPreviousItemActive() :
            this.setNextItemActive();
          break;
        } else return;
    
      case ARROW_LEFT:
      case LEFT:
        if (this.state.horizontal && isModifierAllowed) {
          this.state.horizontal === 'rtl' ?
            this.setNextItemActive() :
            this.setPreviousItemActive();
          break;
        } else return;
    
      default:
        if (isModifierAllowed || event.shiftKey) {
          if (key && key.length === 1) {
            addKey.call(this, key.toLocaleUpperCase());
          } else {
            // Attempt to use the `event.key` which also maps it to the user's keyboard language,
            // otherwise fall back to resolving alphanumeric characters via the keyCode.
            const keyCode = event.keyCode;
            if (
              (keyCode >= 'A'.charCodeAt(0) && keyCode <= 'Z'.charCodeAt(0))
              || (keyCode >= '0'.charCodeAt(0) && keyCode <= '9'.charCodeAt(0))
            ) {
              addKey.call(this, String.fromCharCode(keyCode));
            }
          }
        }
      
        // Note that we return here, in order to avoid preventing
        // the default action of non-navigational keys.
        return;
    }

    this.setState({ pressedLetters: [] });
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

    const activeItem = itemArray[index];
    
    this.setState(state => ({
      provide: {
        ...state.provide,
        activeItemIndex: index,
        activeItem: _.isNil(activeItem) ? null : activeItem,
      },
    }), () => {
      // Invoke the change handler to whoever is listening
      this.state.onChange(index);
    });
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
function setConfig({ wrap, vertical, horizontal, typeAhead, skipPredicateFn,
  getLabel, tabOutFn, items, onChange, allowedModifierKeys,
}) {
  const newState = _.pickBy(arguments[0], _.negate(_.isUndefined));
  this.setState(newState);
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
    _.invoke(this.getStringFromKeys, 'cancel');
    this.getStringFromKeys(this.state.pressedLetters);
  });
}

/*
Get string from array
 */
function getStringFromKeys(array = []) {
  if (array.length > 0) {
    onTypeAhead.call(this, array.join(''));
  }
}

/*
Get the appropriate list item from the string
 */
function onTypeAhead(inputString) {
  const items = this.state.items;

  // Start at 1 because we want to start searching at the item immediately
  // following the current active item.
  for (let i = 1; i < items.length; i++) {
    const index = (this.state.activeItemIndex + i) % items.length;
    const item = items[index];

    if (
      !this.state.skipPredicateFn(item)
      && this.state.getLabel(item).toUpperCase().trim().indexOf(inputString) === 0
    ) {
      this.setActiveItem(index);
      break;
    }
  }

  this.setState({ pressedLetters: [] });
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
 * React to changes in the children, i.e., if they're not of the same length,
 * or if the order is different within them, and then update the activeItem
 * index accordingly.
 */
function updateActiveItemOnItemsChange(newItems) {
  if (this.state.provide.activeItem) {
    const activeItemLabel = this.state.getLabel(this.state.provide.activeItem);
    const newIndex = _.findIndex(newItems, item => this.state.getLabel(item) === activeItemLabel);

    if (newIndex > -1 && newIndex !== this.state.provide.activeItemIndex) {
      this.setState(state => ({
        provide: {
          ...state.provide,
          activeItemIndex: newIndex,
        },
      }));
    }
  }
}
