import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { ListKeyManager, withListKeyConsumer } from '../../exports';
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, TAB } from '../../../keycodes/keys';

const toArray = React.Children.toArray;

describe('ListKeyManager smoke test', () => {
  it('should render without problems', () => {
    const div = document.createElement('div');
    ReactDOM.render((
      <ListKeyManager>
        <PlainListWithManager />
      </ListKeyManager>
    ), div);
  });
});

describe('ListKeyManager', () => {
  let wrapper;
  let keyManager;
  let plainList;
  let keyManagerInstance;
  let setActiveItemSpy;
  let onChangeSpy;
  let keyboardEvents;

  beforeAll(() => {
    wrapper = mount(
      <ListKeyManager>
        <PlainListWithManager />
      </ListKeyManager>
    );
  });

  beforeEach(() => {
    keyboardEvents = {
      TAB: new KeyboardEvent('keydown', { key: TAB, cancelable: true, bubbles: true }),
      DOWN: new KeyboardEvent('keydown', { key: ARROW_DOWN, cancelable: true, bubbles: true }),
      UP: new KeyboardEvent('keydown', { key: ARROW_UP, cancelable: true, bubbles: true }),
      RIGHT: new KeyboardEvent('keydown', { key: ARROW_RIGHT, cancelable: true, bubbles: true }),
      LEFT: new KeyboardEvent('keydown', { key: ARROW_LEFT, cancelable: true, bubbles: true }),
    };

    wrapper.mount();

    keyManager = wrapper.find('ListKeyManager');
    plainList = wrapper.find('PlainList');

    keyManagerInstance = keyManager.instance();

    // First item is already focused
    keyManagerInstance.setFirstItemActive();

    setActiveItemSpy = jest.spyOn(keyManagerInstance, 'setActiveItem');
  });

  afterEach(() => {
    wrapper.unmount();
    jest.resetAllMocks();
  });

  it('should start off the activeItem as null', () => {
    const w = mount(
      <ListKeyManager>
        <PlainListWithManager />
      </ListKeyManager>
    );

    expect(w.state('provide').activeItem).toBe(null);
  });

  it('should maintain the active item if the number of items changes', () => {
    const state = keyManagerInstance.state;
    expect(state.provide.activeItemIndex).toBe(0);
    expect(state.getLabel(state.provide.activeItem))
      .toBe('Thorium');

    plainList.instance().setState(state => ({
      ITEMS: ['Actinium', ...state.ITEMS],
      disabled: [false, ...state.disabled],
    }));

    // Same label
    expect(state.getLabel(keyManagerInstance.state.provide.activeItem))
      .toBe('Thorium');
    // But different index
    expect(keyManagerInstance.state.provide.activeItemIndex).toBe(1);
  });

  it('should set the activeItem to null if an invalid index is passed in', () => {
    keyManagerInstance.setActiveItem(10);
    expect(keyManagerInstance.state.provide.activeItem).toBe(null);
  });

  describe('Key events', () => {
    it('should call tabOutFn when the tab key is pressed', () => {
      const spy = jest.spyOn(keyManagerInstance.state, 'tabOutFn');
      keyManagerInstance.onKeyDown(keyboardEvents.TAB);

      expect(spy).toHaveBeenCalled();
    });

    it('should call tabOutFn when the tab key is pressed + modifier', () => {
      const spy = jest.spyOn(keyManagerInstance.state, 'tabOutFn');

      Object.defineProperty(keyboardEvents.TAB, 'shiftKey', { get: () => true });

      keyManagerInstance.onKeyDown(keyboardEvents.TAB);

      expect(spy).toHaveBeenCalled();
    });

    it('should emit an event when the active item changes', () => {
      const spy = jest.spyOn(keyManagerInstance.state, 'onChange');
      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);

      expect(spy).toHaveBeenCalledTimes(1);

      keyManagerInstance.onKeyDown(keyboardEvents.UP);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should activate the first item when pressing down on a clean key manager', () => {
      const w = mount(
        <ListKeyManager>
          <PlainListWithManager />
        </ListKeyManager>
      );

      expect(w.state('provide').activeItemIndex)
        .toBe(-1, 'Expected active index to default to -1');

      w.instance().onKeyDown(keyboardEvents.DOWN);

      expect(w.state('provide').activeItemIndex)
        .toBe(0, 'Expected first item to become active after pressing key down');
    });

    it('should not prevent the default keyboard action when pressing tab', () => {
      expect(keyboardEvents.TAB.defaultPrevented).toBe(false);

      keyManager.instance().onKeyDown(keyboardEvents.TAB);

      expect(keyboardEvents.TAB.defaultPrevented).toBe(false);
    });

    it('should not do anything for unsupported key presses', () => {
      const unsupported = new KeyboardEvent('keydown', {
        key: '/',
      });
      keyManagerInstance.setActiveItem(1);

      expect(keyManagerInstance.state.provide.activeItemIndex).toBe(1);
      expect(unsupported.defaultPrevented).toBe(false);

      keyManagerInstance.onKeyDown(unsupported);

      expect(keyManagerInstance.state.provide.activeItemIndex).toBe(1);
      expect(unsupported.defaultPrevented).toBe(false);
    });

    it('should ignore the horizontal keys when only in vertical mode', () => {
      keyManager.setState({ horizontal: null, vertical: true });

      expect(keyManagerInstance.state.provide.activeItemIndex).toBe(0);

      keyManagerInstance.onKeyDown(keyboardEvents.RIGHT);

      expect(keyManagerInstance.state.provide.activeItemIndex).toBe(0);
      expect(keyboardEvents.RIGHT.defaultPrevented).toBe(false);
    });

    it('should ignore the horizontal keys when only in horizontal mode', () => {
      keyManager.setState({ horizontal: 'ltr', vertical: false });

      expect(keyManagerInstance.state.provide.activeItemIndex).toBe(0);

      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);

      expect(keyManagerInstance.state.provide.activeItemIndex).toBe(0);
      expect(keyboardEvents.DOWN.defaultPrevented).toBe(false);
    });

    describe('with `vertical` direction', function() {
      // We use a function(){} to ensure a `this` binding.
      beforeEach(() => {
        keyManager.setState({ vertical: true });
        this.nextKeyEvent = keyboardEvents.DOWN;
        this.prevKeyEvent = keyboardEvents.UP;
      });

      runDirectionalKeyTests.call(this);
    });

    describe('with `ltr` direction', function() {
      beforeEach(() => {
        keyManager.setState({ horizontal: 'ltr' });
        this.nextKeyEvent = keyboardEvents.RIGHT;
        this.prevKeyEvent = keyboardEvents.LEFT;
      });

      runDirectionalKeyTests.call(this);
    });

    describe('with `rtl` direction', function() {
      beforeEach(() => {
        keyManager.setState({ horizontal: 'rtl' });
        this.nextKeyEvent = keyboardEvents.LEFT;
        this.prevKeyEvent = keyboardEvents.RIGHT;
      });

      runDirectionalKeyTests.call(this);
    });

    /**
     * Defines the directional key tests that should be run in a particular context. Note that
     * parameters have to be passed in via Jasmine's context object (`this` inside a `beforeEach`)
     * because this function has to run before any `beforeEach`, `beforeAll` etc. hooks.
     */
    function runDirectionalKeyTests() {
      it('should set subsequent items as active when the next key is pressed', () => {
        keyManagerInstance.onKeyDown(this.nextKeyEvent);

        expect(keyManagerInstance.state.provide.activeItemIndex)
          .toBe(1, 'Expected active item to be 1 after one next key event.');
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(0);
        expect(setActiveItemSpy).toHaveBeenCalledWith(1);
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(2);

        keyManagerInstance.onKeyDown(this.nextKeyEvent);
        expect(keyManagerInstance.state.provide.activeItemIndex)
          .toBe(2, 'Expected active item to be 2 after two next key events.');
        expect(setActiveItemSpy).toHaveBeenCalledWith(2);
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(0);
      });

      it('should set first item active when the next key is pressed if no active item', () => {
        keyManagerInstance.setActiveItem(-1);
        keyManagerInstance.onKeyDown(this.nextKeyEvent);

        expect(keyManagerInstance.state.provide.activeItemIndex)
          .toBe(0, 'Expected active item to be 0 after next key if active item was null.');
        expect(setActiveItemSpy).toHaveBeenCalledWith(0);
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(1);
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(2);
      });

      it('should set previous items as active when the previous key is pressed', () => {
        keyManagerInstance.onKeyDown(this.nextKeyEvent);

        expect(keyManagerInstance.state.provide.activeItemIndex)
          .toBe(1, 'Expected active item to be 1 after one next key event.');
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(0);
        expect(setActiveItemSpy).toHaveBeenCalledWith(1);

        keyManagerInstance.onKeyDown(this.prevKeyEvent);
        expect(keyManagerInstance.state.provide.activeItemIndex)
          .toBe(0, 'Expected active item to be 0 after one next and one previous key event.');
        expect(setActiveItemSpy).toHaveBeenCalledWith(0);
      });

      it('should do nothing when the prev key is pressed if no active item and not wrap', () => {
        keyManager.setState({ wrap: false });
        keyManagerInstance.setActiveItem(-1);
        keyManagerInstance.onKeyDown(this.prevKeyEvent);

        expect(keyManagerInstance.state.provide.activeItemIndex)
          .toBe(-1, 'Expected nothing to happen if prev event occurs and no active item.');
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(0);
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(1);
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(2);
      });

      it('should skip disabled items', () => {
        plainList.instance().setState((state) => {
          const { disabled } = state;
          const newDisabled = [...disabled];
          newDisabled.splice(1, 1, true);
          return {
            disabled: newDisabled,
          };
        });

        // Next event should skip past disabled item from 0 to 2
        keyManagerInstance.onKeyDown(this.nextKeyEvent);
        expect(keyManagerInstance.state.provide.activeItemIndex)
          .toBe(2, 'Expected active item to skip past disabled item on next event.');
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(0);
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(1);
        expect(setActiveItemSpy).toHaveBeenCalledWith(2);

        // Previous event should skip past disabled item from 2 to 0
        keyManagerInstance.onKeyDown(this.prevKeyEvent);
        expect(keyManagerInstance.state.provide.activeItemIndex)
          .toBe(0, 'Expected active item to skip past disabled item on up arrow.');
        expect(setActiveItemSpy).toHaveBeenCalledWith(0);
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(1);
      });

      it('should not move active item past either end of the list', () => {
        keyManager.setState({ wrap: false });
        keyManagerInstance.onKeyDown(this.nextKeyEvent);
        keyManagerInstance.onKeyDown(this.nextKeyEvent);
        expect(keyManager.state('provide').activeItemIndex)
          .toBe(2, 'Expected last item of the list to be active.');

        // This next event would move the active item past the end of the list
        // but without wrap: true, this should not happen
        keyManagerInstance.onKeyDown(this.nextKeyEvent);
        expect(keyManager.state('provide').activeItemIndex)
          .toBe(2, 'Expect active item to remain at the end of the list.');

        // In other direction
        keyManagerInstance.onKeyDown(this.prevKeyEvent);
        keyManagerInstance.onKeyDown(this.prevKeyEvent);
        expect(keyManager.state('provide').activeItemIndex)
          .toBe(0, 'Expected first item fo the list to be active.');

        // Try to move backwards past 0
        keyManagerInstance.onKeyDown(this.prevKeyEvent);
        expect(keyManager.state('provide').activeItemIndex)
          .toBe(0, 'Expect active item to remain at the beginning of the list.');
      });

      it('should not move active item to the end when the last item is disabled', () => {
        keyManager.setState({ wrap: false });
        plainList.instance().setState((state) => {
          // set the last item as disabled
          const { disabled } = state;
          const newDisabled = [...disabled];
          newDisabled.splice(2, 1, true);
          return {
            disabled: newDisabled,
          };
        });

        keyManagerInstance.onKeyDown(this.nextKeyEvent);
        expect(keyManager.state('provide').activeItemIndex)
          .toBe(1, 'Expect second item of the list to be active');

        // simulate next key, which would normally activate the last item
        // but since it's disabled, it shouldn't
        keyManagerInstance.onKeyDown(this.nextKeyEvent);
        expect(keyManager.state('provide').activeItemIndex)
          .toBe(1, 'Expect second item to remain active');
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(2);
      });

      it('should prevent the default keyboard action of handled events', () => {
        expect(this.nextKeyEvent.defaultPrevented).toBe(false);
        keyManagerInstance.onKeyDown(this.nextKeyEvent);
        expect(this.nextKeyEvent.defaultPrevented).toBe(true);

        expect(this.prevKeyEvent.defaultPrevented).toBe(false);
        keyManagerInstance.onKeyDown(this.prevKeyEvent);
        expect(this.prevKeyEvent.defaultPrevented).toBe(true);
      });

      ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].forEach((modifier) => {
        it(`should not do anything for arrow keys if ${modifier} is active`, () => {
          runModifierKeyTest.call(this, modifier);
        });
      });
    }

    /** Runs the test that asserts that we handle modifier keys correctly. */
    function runModifierKeyTest(modifier) {
      const initialActiveIndex = keyManager.state('provide').activeItemIndex;
      onChangeSpy = jest.spyOn(keyManagerInstance.state, 'onChange');

      expect(this.nextKeyEvent.defaultPrevented).toBe(false);
      expect(this.prevKeyEvent.defaultPrevented).toBe(false);

      Object.defineProperty(this.nextKeyEvent, modifier, { get: () => true });
      Object.defineProperty(this.prevKeyEvent, modifier, { get: () => true });

      // This key event now has a modifier pressed
      keyManagerInstance.onKeyDown(this.nextKeyEvent);
      expect(this.nextKeyEvent.defaultPrevented).toBe(false);
      expect(keyManager.state('provide').activeItemIndex).toBe(initialActiveIndex);
      expect(onChangeSpy).not.toHaveBeenCalled();

      keyManagerInstance.onKeyDown(this.prevKeyEvent);
      expect(this.prevKeyEvent.defaultPrevented).toBe(false);
      expect(keyManager.state('provide').activeItemIndex).toBe(initialActiveIndex);
      expect(onChangeSpy).not.toHaveBeenCalled();
    }
  });
});

/**
 * Rather than test a library component, this testable component
 * represents how most other library components interact with
 * the ListKeyManager, without any additional overhead.
 */
/** Fake list key item */
function ListKeyItem(props) {
  return (
    <li>{ props.label }</li>
  )
}

ListKeyItem.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string,
};

ListKeyItem.defaultProps = {
  disabled: false,
  label: '',
  __key: 'ListKeyItem',
};

class List extends React.Component {
  render() {
    return <ul>{ this.props.children }</ul>
  }
}

const LIST_ITEMS = [
  'Actinium',
  'Thorium',
  'Protactinium',
  'Uranium',
  'Neptunium',
  'Plutonium',
  'Americium',
  'Curium',
  'Berkelium',
  'Californium',
  'Einsteinium',
  'Fermium',
  'Mendelevium',
  'Nobelium',
  'Lawrencium',
  'Lanthanum',
  'Cerium',
  'Praseodymium',
  'Neodymium',
  'Promethium',
  'Samarium',
  'Europium',
  'Gadolinium',
  'Terbium',
  'Dysprosium',
  'Holmium',
  'Erbium',
  'Thulium',
  'Ytterbium',
  'Lutetium',
];

class PlainList extends React.Component {
  constructor() {
    super();

    this.state = {
      ITEMS: [...LIST_ITEMS].slice(1, 4),
      disabled: _.times(3, _.stubFalse),
    };

    this.LIST_REF = React.createRef();
  }

  componentDidMount() {
    this.props.__keyManager.setConfig({
      items: toArray(this.LIST_REF.current.props.children),
      getLabel: item => _.get(item.props, 'label', ''),
    });

    if (this.LIST_REF.current) {
      /*
      This is a very contrived workaround because for the most part,
      the library component will already have access to this.props.children,
      and would be able to invoke setItemsIfChanged themselves.
       */
      const update = this.props.__keyManager.setItemsIfChanged;
      const previousCDU = this.LIST_REF.current.componentDidUpdate || _.noop;
      this.LIST_REF.current.componentDidUpdate = function(prevProps) {
        previousCDU();
        update(toArray(prevProps.children), toArray(this.props.children));
      }.bind(this.LIST_REF.current);
    }
  }

  render() {
    return (
      <List ref={this.LIST_REF}>
        { this.state.ITEMS.map((item, index) => (
          <ListKeyItem key={item} label={item} disabled={this.state.disabled[index]} />
        )) }
      </List>
    );
  }
}

const PlainListWithManager = withListKeyConsumer(PlainList);
