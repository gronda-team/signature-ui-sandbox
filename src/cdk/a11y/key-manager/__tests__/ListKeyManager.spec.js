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
      <ListKeyManager />
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
    wrapper = mount(<PlainList />);
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

    keyManager = wrapper.find(ListKeyManager);
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
    const w = mount(<PlainList />);

    expect(w.find('ListKeyManager').instance().state.activeItem).toBe(null);
  });

  it('should maintain the active item if the number of items changes', () => {
    const state = keyManagerInstance.state;
    const props = keyManagerInstance.props;
    expect(state.activeItemIndex).toBe(0);
    expect(props.getLabel(state.activeItem))
      .toBe('Thorium');

    plainList.instance().setState(state => ({
      ITEMS: ['Actinium', ...state.ITEMS],
      disabled: [false, ...state.disabled],
    }));

    // Same label
    expect(props.getLabel(keyManagerInstance.state.activeItem))
      .toBe('Thorium');
    // But different index
    expect(keyManagerInstance.state.activeItemIndex).toBe(1);
  });

  it('should set the activeItem to null if an invalid index is passed in', () => {
    keyManagerInstance.setActiveItem(10);
    expect(keyManagerInstance.state.activeItem).toBe(null);
  });

  describe('Key events', () => {
    it('should call onTabOut when the tab key is pressed', () => {
      const spy = jest.fn();
      wrapper.setProps({ onTabOut: spy });

      keyManagerInstance.onKeyDown(keyboardEvents.TAB);

      expect(spy).toHaveBeenCalled();
    });

    it('should call onTabOut when the tab key is pressed + modifier', () => {
      const spy = jest.fn();
      wrapper.setProps({ onTabOut: spy });

      Object.defineProperty(keyboardEvents.TAB, 'shiftKey', { get: () => true });

      keyManagerInstance.onKeyDown(keyboardEvents.TAB);

      expect(spy).toHaveBeenCalled();
    });

    it('should emit an event when the active item changes', () => {
      const onChangeSpy = jest.fn();
      wrapper.setProps({
        onChange: onChangeSpy,
      });

      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);

      expect(onChangeSpy).toHaveBeenCalledTimes(1);

      keyManagerInstance.onKeyDown(keyboardEvents.UP);

      expect(onChangeSpy).toHaveBeenCalledTimes(2);
    });

    it('should activate the first item when pressing down on a clean key manager', () => {
      const w = mount(<PlainList />);
      const km = w.find(ListKeyManager).instance();

      expect(km.state.activeItemIndex).toBe(-1);

      km.onKeyDown(keyboardEvents.DOWN);

      expect(km.state.activeItemIndex).toBe(0);
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

      expect(keyManagerInstance.state.activeItemIndex).toBe(1);
      expect(unsupported.defaultPrevented).toBe(false);

      keyManagerInstance.onKeyDown(unsupported);

      expect(keyManagerInstance.state.activeItemIndex).toBe(1);
      expect(unsupported.defaultPrevented).toBe(false);
    });

    it('should ignore the horizontal keys when only in vertical mode', () => {
      wrapper.setProps({ horizontal: null, vertical: true });

      expect(keyManagerInstance.state.activeItemIndex).toBe(0);

      keyManagerInstance.onKeyDown(keyboardEvents.RIGHT);

      expect(keyManagerInstance.state.activeItemIndex).toBe(0);
      expect(keyboardEvents.RIGHT.defaultPrevented).toBe(false);
    });

    it('should ignore the horizontal keys when only in horizontal mode', () => {
      wrapper.setProps({ horizontal: 'ltr', vertical: false });

      expect(keyManagerInstance.state.activeItemIndex).toBe(0);

      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);

      expect(keyManagerInstance.state.activeItemIndex).toBe(0);
      expect(keyboardEvents.DOWN.defaultPrevented).toBe(false);
    });

    describe('with `vertical` direction', function() {
      // We use a function(){} to ensure a `this` binding.
      beforeEach(() => {
        wrapper.setProps({ vertical: true });
        this.nextKeyEvent = keyboardEvents.DOWN;
        this.prevKeyEvent = keyboardEvents.UP;
      });

      runDirectionalKeyTests.call(this);
    });

    describe('with `ltr` direction', function() {
      beforeEach(() => {
        wrapper.setProps({ horizontal: 'ltr' });
        this.nextKeyEvent = keyboardEvents.RIGHT;
        this.prevKeyEvent = keyboardEvents.LEFT;
      });

      runDirectionalKeyTests.call(this);
    });

    describe('with `rtl` direction', function() {
      beforeEach(() => {
        wrapper.setProps({ horizontal: 'rtl' });
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

        expect(keyManagerInstance.state.activeItemIndex)
          .toBe(1, 'Expected active item to be 1 after one next key event.');
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(0);
        expect(setActiveItemSpy).toHaveBeenCalledWith(1);
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(2);

        keyManagerInstance.onKeyDown(this.nextKeyEvent);
        expect(keyManagerInstance.state.activeItemIndex)
          .toBe(2, 'Expected active item to be 2 after two next key events.');
        expect(setActiveItemSpy).toHaveBeenCalledWith(2);
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(0);
      });

      it('should set first item active when the next key is pressed if no active item', () => {
        keyManagerInstance.setActiveItem(-1);
        keyManagerInstance.onKeyDown(this.nextKeyEvent);

        expect(keyManagerInstance.state.activeItemIndex)
          .toBe(0, 'Expected active item to be 0 after next key if active item was null.');
        expect(setActiveItemSpy).toHaveBeenCalledWith(0);
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(1);
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(2);
      });

      it('should set previous items as active when the previous key is pressed', () => {
        keyManagerInstance.onKeyDown(this.nextKeyEvent);

        expect(keyManagerInstance.state.activeItemIndex)
          .toBe(1, 'Expected active item to be 1 after one next key event.');
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(0);
        expect(setActiveItemSpy).toHaveBeenCalledWith(1);

        keyManagerInstance.onKeyDown(this.prevKeyEvent);
        expect(keyManagerInstance.state.activeItemIndex)
          .toBe(0, 'Expected active item to be 0 after one next and one previous key event.');
        expect(setActiveItemSpy).toHaveBeenCalledWith(0);
      });

      it('should do nothing when the prev key is pressed if no active item and not wrap', () => {
        wrapper.setProps({ wrap: false });
        keyManagerInstance.setActiveItem(-1);
        keyManagerInstance.onKeyDown(this.prevKeyEvent);

        expect(keyManagerInstance.state.activeItemIndex)
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
        expect(keyManagerInstance.state.activeItemIndex)
          .toBe(2, 'Expected active item to skip past disabled item on next event.');
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(0);
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(1);
        expect(setActiveItemSpy).toHaveBeenCalledWith(2);

        // Previous event should skip past disabled item from 2 to 0
        keyManagerInstance.onKeyDown(this.prevKeyEvent);
        expect(keyManagerInstance.state.activeItemIndex)
          .toBe(0, 'Expected active item to skip past disabled item on up arrow.');
        expect(setActiveItemSpy).toHaveBeenCalledWith(0);
        expect(setActiveItemSpy).not.toHaveBeenCalledWith(1);
      });

      it('should not move active item past either end of the list', () => {
        wrapper.setProps({ wrap: false });
        keyManagerInstance.onKeyDown(this.nextKeyEvent);
        keyManagerInstance.onKeyDown(this.nextKeyEvent);
        expect(keyManagerInstance.state.activeItemIndex)
          .toBe(2, 'Expected last item of the list to be active.');

        // This next event would move the active item past the end of the list
        // but without wrap: true, this should not happen
        keyManagerInstance.onKeyDown(this.nextKeyEvent);
        expect(keyManagerInstance.state.activeItemIndex)
          .toBe(2, 'Expect active item to remain at the end of the list.');

        // In other direction
        keyManagerInstance.onKeyDown(this.prevKeyEvent);
        keyManagerInstance.onKeyDown(this.prevKeyEvent);
        expect(keyManagerInstance.state.activeItemIndex)
          .toBe(0, 'Expected first item fo the list to be active.');

        // Try to move backwards past 0
        keyManagerInstance.onKeyDown(this.prevKeyEvent);
        expect(keyManagerInstance.state.activeItemIndex)
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
        expect(keyManagerInstance.state.activeItemIndex)
          .toBe(1, 'Expect second item of the list to be active');

        // simulate next key, which would normally activate the last item
        // but since it's disabled, it shouldn't
        keyManagerInstance.onKeyDown(this.nextKeyEvent);
        expect(keyManagerInstance.state.activeItemIndex)
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
      const initialActiveIndex = keyManagerInstance.state.activeItemIndex;
      const spy = jest.fn();
      wrapper.setProps({ onChange: spy });

      expect(this.nextKeyEvent.defaultPrevented).toBe(false);
      expect(this.prevKeyEvent.defaultPrevented).toBe(false);

      Object.defineProperty(this.nextKeyEvent, modifier, { get: () => true });
      Object.defineProperty(this.prevKeyEvent, modifier, { get: () => true });

      // This key event now has a modifier pressed
      keyManagerInstance.onKeyDown(this.nextKeyEvent);
      expect(this.nextKeyEvent.defaultPrevented).toBe(false);
      expect(keyManagerInstance.state.activeItemIndex).toBe(initialActiveIndex);
      expect(spy).not.toHaveBeenCalled();

      keyManagerInstance.onKeyDown(this.prevKeyEvent);
      expect(this.prevKeyEvent.defaultPrevented).toBe(false);
      expect(keyManagerInstance.state.activeItemIndex).toBe(initialActiveIndex);
      expect(spy).not.toHaveBeenCalled();
    }
  });

  // Using the individual functions that are passed as context
  describe('Programmatic focus (functions passed as context)', () => {
    it('should setActiveItem()', () => {
      expect(keyManagerInstance.state.activeItemIndex).toBe(0);

      keyManagerInstance.setActiveItem(1);
      expect(keyManagerInstance.state.activeItemIndex).toBe(1);
    });

    it('should be able to set the active item by reference', () => {
      expect(keyManagerInstance.state.activeItemIndex).toBe(0);

      const item = keyManagerInstance.props.items[2];
      keyManagerInstance.setActiveItem(item);

      expect(keyManagerInstance.state.activeItemIndex).toBe(2);
    });

    it('should be able to set the active item without emitting', () => {
      const spy = jest.fn();
      wrapper.setProps({ onChange: spy });

      expect(keyManagerInstance.state.activeItemIndex).toBe(0);
      keyManagerInstance.updateActiveItem(2);

      expect(keyManagerInstance.state.activeItemIndex).toBe(2);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should expose the active item correctly', () => {
      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);
      expect(keyManagerInstance.state.activeItemIndex).toBe(1);
      expect(keyManagerInstance.props.getLabel(keyManagerInstance.state.activeItem))
        .toBe('Protactinium');

      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);
      expect(keyManagerInstance.state.activeItemIndex).toBe(2);
      expect(keyManagerInstance.props.getLabel(keyManagerInstance.state.activeItem))
        .toBe('Uranium');
    });

    it('should setFirstItemActive()', () => {
      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);
      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);
      expect(keyManagerInstance.state.activeItemIndex).toBe(2);

      keyManagerInstance.setFirstItemActive();

      expect(keyManagerInstance.state.activeItemIndex).toBe(0);
    });

    it('should set the first item active to the second item if the first one is disabled', () => {
      plainList.setState({
        disabled: [true, false, false],
      });

      keyManagerInstance.setFirstItemActive();
      expect(keyManagerInstance.state.activeItemIndex).toBe(1);
    });

    it('should setLastItemActive()', () => {
      keyManagerInstance.setLastItemActive();

      expect(keyManagerInstance.state.activeItemIndex).toBe(2);
    });

    it('should set the active item to the penultimate item if the last one is disabled', () => {
      plainList.setState({
        disabled: [false, false, true],
      });

      keyManagerInstance.setLastItemActive();
      expect(keyManagerInstance.state.activeItemIndex).toBe(1);
    });

    it('should setNextItemActive()', () => {
      expect(keyManagerInstance.state.activeItemIndex).toBe(0);
      keyManagerInstance.setNextItemActive();
      expect(keyManagerInstance.state.activeItemIndex).toBe(1);
    });

    it('should set the next active item to the next enabled item', () => {
      plainList.setState({
        disabled: [false, true, false],
      });

      expect(keyManagerInstance.state.activeItemIndex).toBe(0);
      keyManagerInstance.setNextItemActive();
      expect(keyManagerInstance.state.activeItemIndex).toBe(2);
    });

    it('should setPreviousItemActive()', () => {
      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);
      expect(keyManagerInstance.state.activeItemIndex).toBe(1);
      keyManagerInstance.setPreviousItemActive();
      expect(keyManagerInstance.state.activeItemIndex).toBe(0);
    });

    it('should set the previous active item to the previous enabled item', () => {
      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);
      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);

      plainList.setState({
        disabled: [false, true, false],
      });

      expect(keyManagerInstance.state.activeItemIndex).toBe(2);
      keyManagerInstance.setPreviousItemActive();
      expect(keyManagerInstance.state.activeItemIndex).toBe(0);
    });

    it('should not call onChange if the item did not change', () => {
      const spy = jest.fn();
      wrapper.setProps({ onChange: spy });

      keyManagerInstance.setActiveItem(2);
      keyManagerInstance.setActiveItem(2);

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  // when the user can wrap around
  describe('Wrap mode', () => {
    it('should wrap focus when arrow keying past items while in wrap mode', () => {
      wrapper.setProps({ wrap: true });
      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);
      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);

      expect(keyManagerInstance.state.activeItemIndex).toBe(2);

      // this down arrow moves down past the end of the list
      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);
      expect(keyManagerInstance.state.activeItemIndex).toBe(0);

      // this up arrow moves up past the beginning of the list
      keyManagerInstance.onKeyDown(keyboardEvents.UP);
      expect(keyManagerInstance.state.activeItemIndex).toBe(2);
    });

    it('should set last item active when up arrow is pressed if no active item', () => {
      wrapper.setProps({ wrap: true });
      keyManagerInstance.setActiveItem(-1);
      keyManagerInstance.onKeyDown(keyboardEvents.UP);

      expect(keyManagerInstance.state.activeItemIndex)
        .toBe(2, 'Expected last item to be active on up arrow if no active item.');
      expect(setActiveItemSpy).not.toHaveBeenCalledWith(0);
      expect(setActiveItemSpy).toHaveBeenCalledWith(2);

      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);
      expect(keyManagerInstance.state.activeItemIndex)
        .toBe(0, 'Expected active item to be 0 after wrapping back to beginning.');
      expect(setActiveItemSpy).toHaveBeenCalledWith(0);
    });

    // This test should pass if all items are disabled and the down arrow key got pressed.
    // If the test setup crashes or this test times out, this test can be considered as failed.
    it('should not get into an infinite loop if all items are disabled', () => {
      wrapper.setProps({ wrap: true });
      keyManagerInstance.setActiveItem(0);

      plainList.setState({ disabled: [true, true, true] });

      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);
    });

    it('should be able to disable wrapping', () => {
      wrapper.setProps({ wrap: true });
      keyManagerInstance.setFirstItemActive();
      keyManagerInstance.onKeyDown(keyboardEvents.UP);

      expect(keyManagerInstance.state.activeItemIndex).toBe(2);

      wrapper.setProps({ wrap: false });
      keyManagerInstance.setFirstItemActive();
      keyManagerInstance.onKeyDown(keyboardEvents.UP);

      expect(keyManagerInstance.state.activeItemIndex).toBe(0);
    });
  });

  // Testing the skipPredicate fn when the user changes it
  describe('skipPredicateFn', () => {
    it('should skip disabled items by default', () => {
      plainList.setState({ disabled: [false, true, false] });

      expect(keyManagerInstance.state.activeItemIndex).toBe(0);

      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);

      expect(keyManagerInstance.state.activeItemIndex).toBe(2);
    });

    it('should be able to skip items with a custom predicate', () => {
      wrapper.setProps({ skipPredicateFn: item => _.get(item.props, 'skip', false )});

      plainList.setState({ skip: [false, true, false ] });

      expect(keyManagerInstance.state.activeItemIndex).toBe(0);

      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);

      expect(keyManagerInstance.state.activeItemIndex).toBe(2);
    });
  });

  // Testing the getLabel fn when the user changes it
  describe('getLabel', () => {
    it('should get props.label from an item by default', () => {
      expect(keyManagerInstance.state.activeItemIndex).toBe(0);
      const getLabel = keyManagerInstance.props.getLabel;
      expect(getLabel(keyManagerInstance.state.activeItem)).toBe('Thorium');
    });

    it('should be able to get a separate view value using a getLabel fn', () => {
      expect(keyManagerInstance.state.activeItemIndex).toBe(0);
      wrapper.setProps({
        getLabel: item => _.get(item.props, 'text', ''),
      });
      const getLabel = keyManagerInstance.props.getLabel;
      expect(getLabel(keyManagerInstance.state.activeItem)).toBe('Thorium');
    });
  });

  describe.skip('typeAhead mode', () => {
    const debounceInterval = 50;
    const createKeyboardEvent = initKeyMap => new KeyboardEvent('keydown', initKeyMap);

    beforeEach(() => {
      keyManager.setState({ typeAhead: debounceInterval });
      keyManagerInstance.setActiveItem(-1);
    });

    it('should debounce the input key presses', (done) => {
      jest.useRealTimers(); // must do this to trigger debounce stuff
      Array.from('Tho').forEach((letter) => {
        keyManagerInstance.onKeyDown(createKeyboardEvent({
          cancelable: true,
          bubbles: true,
          keyCode: letter.charCodeAt(0),
          key: letter,
        }));
      });

      expect(keyManagerInstance.state.activeItemIndex).not.toBe(0);
      setTimeout(() => {
        expect(keyManagerInstance.state.activeItemIndex).toBe(0);
        done();
      }, debounceInterval);

      jest.useFakeTimers();
    });

    it('should focus the first item that starts with a letter', () => {
      jest.useRealTimers(); // must do this to trigger debounce stuff
      keyManagerInstance.onKeyDown(createKeyboardEvent({
        cancelable: true,
        bubbles: true,
        keyCode: 'p'.charCodeAt(0),
        key: 'p',
      }));

      setTimeout(() => {
        expect(keyManagerInstance.state.activeItemIndex).toBe(1);
        done();
      }, debounceInterval);

      jest.useFakeTimers();
    });

    it('should not move focus if a modifier, that is not allowed, is pressed', fakeAsync(() => {
      const tEvent = createKeyboardEvent('keydown', 84, undefined, 't');
      Object.defineProperty(tEvent, 'ctrlKey', {get: () => true});

      expect(keyManager.activeItem).toBeFalsy();

      keyManagerInstance.onKeyDown(tEvent); // types "t"
      tick(debounceInterval);

      expect(keyManager.activeItem).toBeFalsy();
    }));

    it('should always allow the shift key', fakeAsync(() => {
      const tEvent = createKeyboardEvent('keydown', 84, undefined, 't');
      Object.defineProperty(tEvent, 'shiftKey', {get: () => true});

      expect(keyManager.activeItem).toBeFalsy();

      keyManagerInstance.onKeyDown(tEvent); // types "t"
      tick(debounceInterval);

      expect(keyManager.activeItem).toBeTruthy();
    }));

    it('should focus the first item that starts with sequence of letters', fakeAsync(() => {
      keyManagerInstance.onKeyDown(createKeyboardEvent('keydown', 84, undefined, 't')); // types "t"
      keyManagerInstance.onKeyDown(createKeyboardEvent('keydown', 72, undefined, 'h')); // types "h"

      tick(debounceInterval);

      expect(keyManager.activeItem).toBe(itemList.items[2]);
    }));

    it('should cancel any pending timers if a navigation key is pressed', fakeAsync(() => {
      keyManagerInstance.onKeyDown(createKeyboardEvent('keydown', 84, undefined, 't')); // types "t"
      keyManagerInstance.onKeyDown(createKeyboardEvent('keydown', 72, undefined, 'h')); // types "h"
      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);

      tick(debounceInterval);

      expect(keyManager.activeItem).toBe(itemList.items[0]);
    }));

    it('should handle non-English input', fakeAsync(() => {
      itemList.items = [
        new FakeFocusable('едно'),
        new FakeFocusable('две'),
        new FakeFocusable('три')
      ];

      const keyboardEvent = createKeyboardEvent('keydown', 68, undefined, 'д');

      keyManagerInstance.onKeyDown(keyboardEvent); // types "д"
      tick(debounceInterval);

      expect(keyManager.activeItem).toBe(itemList.items[1]);
    }));

    it('should handle non-letter characters', fakeAsync(() => {
      itemList.items = [
        new FakeFocusable('[]'),
        new FakeFocusable('321'),
        new FakeFocusable('`!?')
      ];

      keyManagerInstance.onKeyDown(createKeyboardEvent('keydown', 192, undefined, '`')); // types "`"
      tick(debounceInterval);
      expect(keyManager.activeItem).toBe(itemList.items[2]);

      keyManagerInstance.onKeyDown(createKeyboardEvent('keydown', 51, undefined, '3')); // types "3"
      tick(debounceInterval);
      expect(keyManager.activeItem).toBe(itemList.items[1]);

      keyManagerInstance.onKeyDown(createKeyboardEvent('keydown', 219, undefined, '[')); // types "["
      tick(debounceInterval);
      expect(keyManager.activeItem).toBe(itemList.items[0]);
    }));

    it('should not focus disabled items', fakeAsync(() => {
      expect(keyManager.activeItem).toBeFalsy();

      itemList.items[0].disabled = true;
      keyManagerInstance.onKeyDown(createKeyboardEvent('keydown', 79, undefined, 'o')); // types "o"
      tick(debounceInterval);

      expect(keyManager.activeItem).toBeFalsy();
    }));

    it('should start looking for matches after the active item', fakeAsync(() => {
      itemList.items = [
        new FakeFocusable('Bilbo'),
        new FakeFocusable('Frodo'),
        new FakeFocusable('Pippin'),
        new FakeFocusable('Boromir'),
        new FakeFocusable('Aragorn')
      ];

      keyManagerInstance.setActiveItem(1);
      keyManagerInstance.onKeyDown(createKeyboardEvent('keydown', 66, undefined, 'b'));
      tick(debounceInterval);

      expect(keyManager.activeItem).toBe(itemList.items[3]);
    }));

    it('should wrap back around if there were no matches after the active item', fakeAsync(() => {
      itemList.items = [
        new FakeFocusable('Bilbo'),
        new FakeFocusable('Frodo'),
        new FakeFocusable('Pippin'),
        new FakeFocusable('Boromir'),
        new FakeFocusable('Aragorn')
      ];

      keyManagerInstance.setActiveItem(3);
      keyManagerInstance.onKeyDown(createKeyboardEvent('keydown', 66, undefined, 'b'));
      tick(debounceInterval);

      expect(keyManager.activeItem).toBe(itemList.items[0]);
    }));

    it('should wrap back around if the last item is active', fakeAsync(() => {
      keyManagerInstance.setActiveItem(2);
      keyManagerInstance.onKeyDown(createKeyboardEvent('keydown', 79, undefined, 'o'));
      tick(debounceInterval);

      expect(keyManager.activeItem).toBe(itemList.items[0]);
    }));

    it('should be able to select the first item', fakeAsync(() => {
      keyManagerInstance.setActiveItem(-1);
      keyManagerInstance.onKeyDown(createKeyboardEvent('keydown', 79, undefined, 'o'));
      tick(debounceInterval);

      expect(keyManager.activeItem).toBe(itemList.items[0]);
    }));

    it('should not do anything if there is no match', fakeAsync(() => {
      keyManagerInstance.setActiveItem(1);
      keyManagerInstance.onKeyDown(createKeyboardEvent('keydown', 87, undefined, 'w'));
      tick(debounceInterval);

      expect(keyManager.activeItem).toBe(itemList.items[1]);
    }));
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
  skip: PropTypes.bool, // alias for skipping
  label: PropTypes.string,
  text: PropTypes.string, // alias for label
};

ListKeyItem.defaultProps = {
  disabled: false,
  skip: false,
  label: '',
  text: '',
  __key: 'ListKeyItem',
};

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
      // for testing the skipPredicateFn
      skip: [false, false, false],
    };
  }

  render() {
    const items = this.state.ITEMS.map((item, index) => (
      <ListKeyItem
        key={item}
        label={item}
        text={item}
        skip={this.state.skip[index]}
        disabled={this.state.disabled[index]}
      />
    ));

    return (
      <ul>
        <ListKeyManager
          wrap={this.props.wrap}
          horizontal={this.props.horizontal}
          vertical={this.props.vertical}
          typeAhead={this.props.typeAhead}
          skipPredicateFn={this.props.skipPredicateFn}
          getLabel={this.props.getLabel}
          onTabOut={this.props.onTabOut}
          onChange={this.props.onChange}
          allowedModifierKeys={this.props.allowedModifierKeys}
          items={items}
        />
        { items }
      </ul>
    );
  }
}

PlainList.defaultProps = ListKeyManager.defaultProps;
