import * as React from 'react';
import styled from 'styled-components';
import invoke from 'lodash/invoke';
import { render, act, fireEvent, createEvent, cleanup } from '@testing-library/react';
import util from '../util';
import { useListKeyManager } from '../../exports';
import { DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, TAB, UP_ARROW } from '../../../Keycodes';

function getManager(method, ...args) {
  return invoke(window.__manager__, method, ...args);
}

const getActiveItemIndex = getManager.bind(null, 'getActiveItemIndex');
const getActiveItem = getManager.bind(null, 'getActiveItem');
const setActiveItem = getManager.bind(null, 'setActiveItem');
const updateActiveItem = getManager.bind(null, 'updateActiveItem');

const TestId = {
  TEST_DIV: 'test-div',
};

// This div won't give any IDE highlighting errors when it has something like `disabled`
// on a div, and it won't say `doesn't recognize the prop on DOM element` React error.
const DivWithoutErrors = styled.div``;

describe('useListKeyManager', function () {
  let rendered;
  let items;

  const mapToItems = array => array.map(item => (
    <DivWithoutErrors key={item.label} {...item} data-list-key={item.label}>{ item.label }</DivWithoutErrors>
  ));

  beforeEach(function () {
    items = [{ label: 'one' }, { label: 'two' }, { label: 'three' }];

    rendered = render(
      <Test>{ mapToItems(items) }</Test>
    );

  });

  afterEach(function () {
    cleanup();
    jest.clearAllMocks();
  });

  it('should start out with `activeItem` as null', function () {
    expect(getActiveItem()).toBe(null);
  });

  it('should set the active item to null if an invalid index is passed in', function () {
    act(() => {
      setActiveItem(1337);
    });

    expect(getActiveItem()).toBe(null);
  });

  it('should maintain the active item if the number of items changes', function () {
    act(() => {
      window.__manager__.setFirstItemActive();
    });

    expect(getActiveItemIndex()).toBe(0);

    items.unshift({ label: 'zero' });

    rendered.rerender(<Test>{ mapToItems(items) }</Test>);

    expect(getActiveItemIndex()).toBe(1);
  });

  describe('key events', function () {
    let target;
    beforeEach(function () {
      target = rendered.queryByTestId(TestId.TEST_DIV);
    });

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should call `config.onTabOut` when the tab key is pressed', function () {
      const tabSpy = jest.fn();
      const config = { onTabOut: tabSpy };
      rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

      fireEvent.keyDown(target, { keyCode: TAB });
      expect(tabSpy).toHaveBeenCalled();
    });

    it('should call `config.onTabOut` when tab + modifier is pressed', function () {
      const tabSpy = jest.fn();
      const config = { onTabOut: tabSpy };
      rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

      fireEvent.keyDown(target, { keyCode: TAB, shiftKey: true });
      expect(tabSpy).toHaveBeenCalled();
    });

    it('should activate the first item when ' +
      'pressing the down arrow on a new key manager', function () {
      expect(getActiveItemIndex()).toBe(-1);

      fireEvent.keyDown(target, { keyCode: DOWN_ARROW });
      expect(getActiveItemIndex()).toBe(0);
    });

    it('should not prevent the default keyboard action when pressing tab', function () {
      const event = createEvent.keyDown(target, { keyCode: TAB });
      const eventSpy = jest.spyOn(event, 'preventDefault');

      fireEvent(target, event);

      expect(eventSpy).not.toHaveBeenCalled();
    });

    it('should not do anything for unsupported key presses', function () {
      act(() => {
        setActiveItem(1);
      });

      expect(getActiveItemIndex()).toBe(1);

      const event = createEvent.keyDown(target, { keyCode: 192 });
      const eventSpy = jest.spyOn(event, 'preventDefault');

      fireEvent(target, event);

      expect(getActiveItemIndex()).toBe(1);
      expect(eventSpy).not.toHaveBeenCalled();
    });

    it('should ignore the horizontal keys when only in vertical mode', function () {
      const config = { vertical: true };
      rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

      act(() => {
        setActiveItem(0);
      });

      expect(getActiveItemIndex()).toBe(0);

      const event = createEvent.keyDown(target, { keyCode: RIGHT_ARROW });
      const eventSpy = jest.spyOn(event, 'preventDefault');

      fireEvent(target, event);
      expect(getActiveItemIndex()).toBe(0);
      expect(eventSpy).not.toHaveBeenCalled();
    });

    it('should ignore the vertical keys when only in horizontal mode', function () {
      const config = { horizontal: 'ltr', vertical: false };
      rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

      act(() => {
        setActiveItem(0);
      });

      expect(getActiveItemIndex()).toBe(0);

      const event = createEvent.keyDown(target, { keyCode: DOWN_ARROW });
      const eventSpy = jest.spyOn(event, 'preventDefault');

      fireEvent(target, event);
      expect(getActiveItemIndex()).toBe(0);
      expect(eventSpy).not.toHaveBeenCalled();
    });

    describe('with `vertical` direction', function () {
      const config = { vertical: true };
      const nextKeyboardEvent = { keyCode: DOWN_ARROW };
      const prevKeyboardEvent = { keyCode: UP_ARROW };

      beforeEach(function () {
        items = [{ label: 'one' }, { label: 'two' }, { label: 'three' }];
        rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

        act(() => {
          setActiveItem(0);
        });
      });

      runDirectionalKeyTests(nextKeyboardEvent, prevKeyboardEvent, config);
    });

    describe('with `ltr` direction', function () {
      const config = { horizontal: 'ltr' };
      const nextKeyboardEvent = { keyCode: RIGHT_ARROW };
      const prevKeyboardEvent = { keyCode: LEFT_ARROW };

      beforeEach(function () {
        rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

        act(() => {
          setActiveItem(0);
        });
      });

      runDirectionalKeyTests(nextKeyboardEvent, prevKeyboardEvent, config);
    });

    describe('with `rtl` direction', function () {
      const config = { horizontal: 'rtl' };
      const nextKeyboardEvent = { keyCode: LEFT_ARROW  };
      const prevKeyboardEvent = { keyCode: RIGHT_ARROW };

      beforeEach(function () {
        rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

        act(() => {
          setActiveItem(0);
        });
      });

      runDirectionalKeyTests(nextKeyboardEvent, prevKeyboardEvent, config);
    });

    /**
     * Defines the directional key tests that should be run in a particular context.
     */
    function runDirectionalKeyTests(nextKeyEvent, prevKeyEvent, config) {
      it('should set subsequent items as active when the next key is pressed', function () {
        fireEvent.keyDown(target, nextKeyEvent);
        expect(getActiveItemIndex()).toBe(1);

        fireEvent.keyDown(target, nextKeyEvent);
        expect(getActiveItemIndex()).toBe(2);
      });

      it('should set first item active when next key is pressed if no active item', function () {
        act(() => {
          setActiveItem(-1);
        });

        fireEvent.keyDown(target, nextKeyEvent);
        expect(getActiveItemIndex()).toBe(0);
      });

      it('should set previous items as active when the previous key is pressed', function () {
        fireEvent.keyDown(target, nextKeyEvent);
        expect(getActiveItemIndex()).toBe(1);

        fireEvent.keyDown(target, prevKeyEvent);
        expect(getActiveItemIndex()).toBe(0);
      });

      it('should do nothing when previous key is pressed with no active item and no wrap', function () {
        act(() => {
          setActiveItem(-1);
        });

        fireEvent.keyDown(target, prevKeyEvent);
        expect(getActiveItemIndex()).toBe(-1);
      });

      it('should skip disabled items', function () {
        items = [{ label: 'one' }, { label: 'two', disabled: true }, { label: 'three' }];
        rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

        fireEvent.keyDown(target, nextKeyEvent);
        expect(getActiveItemIndex()).toBe(2);

        fireEvent.keyDown(target, prevKeyEvent);
        expect(getActiveItemIndex()).toBe(0);
      });

      it("should work normally when the disabled property doesn't exist", function () {
        items = [
          { label: 'one', disabled: undefined }, { label: 'two', disabled: undefined }, { label: 'three', disabled: undefined }
        ];
        rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

        fireEvent.keyDown(target, nextKeyEvent);
        expect(getActiveItemIndex()).toBe(1);

        fireEvent.keyDown(target, nextKeyEvent);
        expect(getActiveItemIndex()).toBe(2);
      });

      it('should not move active item past either end of the list', function () {
        fireEvent.keyDown(target, nextKeyEvent);
        fireEvent.keyDown(target, nextKeyEvent);
        expect(getActiveItemIndex()).toBe(2);

        // This event would move past the end of the list
        fireEvent.keyDown(target, nextKeyEvent);
        expect(getActiveItemIndex()).toBe(2);

        fireEvent.keyDown(target, prevKeyEvent);
        fireEvent.keyDown(target, prevKeyEvent);
        expect(getActiveItemIndex()).toBe(0);

        // This event would move past the beginning of the list
        fireEvent.keyDown(target, prevKeyEvent);
        expect(getActiveItemIndex()).toBe(0);
      });

      it('should not move active item to end when the last item is disabled', function () {
        items = [
          { label: 'one' }, { label: 'two' }, { label: 'three', disabled: true }
        ];
        rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

        fireEvent.keyDown(target, nextKeyEvent);
        expect(getActiveItemIndex()).toBe(1);

        // Last item is disabled, so expect the cursor not to move
        fireEvent.keyDown(target, nextKeyEvent);
        expect(getActiveItemIndex()).toBe(1);
      });

      it('should prevent the default keyboard action of handled events', function () {
        const nextEvent = createEvent.keyDown(target, nextKeyEvent);
        const prevEvent = createEvent.keyDown(target, prevKeyEvent);

        const nextEventSpy = jest.spyOn(nextEvent, 'preventDefault');
        const prevEventSpy = jest.spyOn(prevEvent, 'preventDefault');

        fireEvent(target, nextEvent);
        expect(nextEventSpy).toHaveBeenCalled();

        fireEvent(target, prevEvent);
        expect(prevEventSpy).toHaveBeenCalled();
      });

      it.each(['ctrlKey', 'shiftKey', 'metaKey', 'altKey'])('should not do anything for arrow keys ' +
        'if `%s` is held down', function (key) {
        runModifierKeyTest(key);
      });

      function runModifierKeyTest(modifier) {
        const initialActiveIndex = getActiveItemIndex();
        const onChangeSpy = jest.fn();
        const modifierKeyConfig = { ...config, onChange: onChangeSpy };
        rendered.rerender(<Test config={modifierKeyConfig}>{ mapToItems(items) }</Test>);

        const configNext = { ...nextKeyEvent, [modifier]: true };
        const configPrev = { ...prevKeyEvent, [modifier]: true };

        const nextEvent = createEvent.keyDown(target, configNext);
        const prevEvent = createEvent.keyDown(target, configPrev);

        const nextEventSpy = jest.spyOn(nextEvent, 'preventDefault');
        const prevEventSpy = jest.spyOn(prevEvent, 'preventDefault');

        fireEvent(target, nextEvent);
        expect(nextEventSpy).not.toHaveBeenCalled();
        expect(getActiveItemIndex()).toBe(initialActiveIndex);
        expect(onChangeSpy).not.toHaveBeenCalled();

        fireEvent(target, prevEvent);
        expect(prevEventSpy).not.toHaveBeenCalled();
        expect(getActiveItemIndex()).toBe(initialActiveIndex);
        expect(onChangeSpy).not.toHaveBeenCalled();
      }
    }
  });

  describe('programmatic focus', function () {
    let target;
    beforeEach(function () {
      act(() => {
        window.__manager__.setFirstItemActive();
      });

      target = rendered.queryByTestId(TestId.TEST_DIV);
    });

    it('should set the active item', function () {
      expect(getActiveItemIndex()).toBe(0);

      act(() => {
        setActiveItem(1);
      });

      expect(getActiveItemIndex()).toBe(1);
    });

    it('should set the first item as active', function () {
      fireEvent.keyDown(target, { keyCode: DOWN_ARROW });
      fireEvent.keyDown(target, { keyCode: DOWN_ARROW });

      expect(getActiveItemIndex()).toBe(2);

      act(() => {
        getManager('setFirstItemActive');
      });
      expect(getActiveItemIndex()).toBe(0);
    });

    it('should set the second item as active if the first item is disabled', function () {
      items = [
        { label: 'one', disabled: true }, { label: 'two' }, { label: 'three' }
      ];

      rendered.rerender(<Test>{ mapToItems(items) }</Test>);
      act(() => {
        getManager('setFirstItemActive');
      });
      expect(getActiveItemIndex()).toBe(1);
    });

    it('should set the last item as active', function () {
      expect(getActiveItemIndex()).toBe(0);
      act(() => {
        getManager('setLastItemActive');
      });
      expect(getActiveItemIndex()).toBe(2);
    });

    it('should set the second to last item as active if the last item is disabled', function () {
      items = [
        { label: 'one' }, { label: 'two' }, { label: 'three', disabled: true }
      ];

      rendered.rerender(<Test>{ mapToItems(items) }</Test>);

      act(() => {
        getManager('setLastItemActive');
      });
      expect(getActiveItemIndex()).toBe(1);
    });

    it('should set the next item as active', function () {
      expect(getActiveItemIndex()).toBe(0);
      act(() => {
        getManager('setNextItemActive');
      });
      expect(getActiveItemIndex()).toBe(1);
    });

    it('should set skip a disabled item to set the next item active', function () {
      items = [
        { label: 'one' }, { label: 'two', disabled: true }, { label: 'three' }
      ];

      rendered.rerender(<Test>{ mapToItems(items) }</Test>);

      expect(getActiveItemIndex()).toBe(0);
      act(() => {
        getManager('setNextItemActive');
      });
      expect(getActiveItemIndex()).toBe(2);
    });

    it('should set the previous item as active', function () {
      fireEvent.keyDown(target, { keyCode: DOWN_ARROW });
      expect(getActiveItemIndex()).toBe(1);
      act(() => {
        getManager('setPreviousItemActive');
      });
      expect(getActiveItemIndex()).toBe(0);
    });

    it('should set skip a disabled item to set the previous item active', function () {
      items = [
        { label: 'one' }, { label: 'two', disabled: true }, { label: 'three' }
      ];

      rendered.rerender(<Test>{ mapToItems(items) }</Test>);
      fireEvent.keyDown(target, { keyCode: DOWN_ARROW });
      fireEvent.keyDown(target, { keyCode: DOWN_ARROW });
      expect(getActiveItemIndex()).toBe(2);

      act(() => {
        getManager('setPreviousItemActive');
      });

      expect(getActiveItemIndex()).toBe(0);
    });

    it('should be able to set the active item without calling the `onChange` callback', function () {
      const config = { onChange: jest.fn() };
      rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);
      expect(getActiveItemIndex()).toBe(0);

      act(() => {
        updateActiveItem(2);
      });

      expect(getActiveItemIndex()).toBe(2);
      expect(config.onChange).not.toHaveBeenCalled();
    });

    it('should not emit an event if the item did not change', function () {
      const config = { onChange: jest.fn() };
      rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

      expect(getActiveItemIndex()).toBe(0);

      act(() => {
        setActiveItem(2);
        setActiveItem(2);
      });

      expect(config.onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('wrap mode', () => {
    let target;
    const config = { wrap: true };
    beforeEach(function () {
      rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

      target = rendered.queryByTestId(TestId.TEST_DIV);

      act(() => {
        setActiveItem(0);
      });
    });

    it('should wrap focus when arrow keying past items while in wrap mode', () => {
      fireEvent.keyDown(target, { keyCode: DOWN_ARROW });
      fireEvent.keyDown(target, { keyCode: DOWN_ARROW });

      expect(getActiveItemIndex()).toBe(2);

      // this down arrow moves down past the end of the list
      fireEvent.keyDown(target, { keyCode: DOWN_ARROW });
      expect(getActiveItemIndex()).toBe(0);

      // this up arrow moves up past the beginning of the list
      fireEvent.keyDown(target, { keyCode: UP_ARROW });
      expect(getActiveItemIndex()).toBe(2);
    });

    it('should set last item active when up arrow is pressed if no active item', () => {
      act(() => {
        setActiveItem(-1);
      });

      fireEvent.keyDown(target, { keyCode: UP_ARROW });

      expect(getActiveItemIndex()).toBe(2);

      fireEvent.keyDown(target, { keyCode: DOWN_ARROW });
      expect(getActiveItemIndex()).toBe(0);
    });

    // This test should pass if all items are disabled and the down arrow key got pressed.
    // If the test setup crashes or this test times out, this test can be considered as failed.
    it('should not get into an infinite loop if all items are disabled', () => {
      act(() => {
        setActiveItem(-1);
      });

      items = [
        { label: 'one', disabled: true }, { label: 'two', disabled: true }, { label: 'three', disabled: true }
      ];

      rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

      fireEvent.keyDown(target, { keyCode: DOWN_ARROW });
    });

    it('should be able to disable wrapping', () => {
      act(() => {
        getManager('setFirstItemActive');
      });

      fireEvent.keyDown(target, { keyCode: UP_ARROW });

      expect(getActiveItemIndex()).toBe(items.length - 1);

      const innerConfig = { wrap: false };
      rendered.rerender(<Test config={innerConfig}>{ mapToItems(items) }</Test>);

      act(() => {
        getManager('setFirstItemActive');
      });

      fireEvent.keyDown(target, { keyCode: UP_ARROW });

      expect(getActiveItemIndex()).toBe(0);
    });
  });

  describe('skip predicate', () => {
    let target;
    beforeEach(function () {
      target = rendered.queryByTestId(TestId.TEST_DIV);

      act(() => {
        setActiveItem(0);
      });
    });

    it('should skip disabled items by default', () => {
      items = [
        { label: 'one' }, { label: 'two', disabled: true }, { label: 'three' },
      ];

      rendered.rerender(<Test>{ mapToItems(items) }</Test>);

      expect(getActiveItemIndex()).toBe(0);

      fireEvent.keyDown(target, { keyCode: DOWN_ARROW });

      expect(getActiveItemIndex()).toBe(2);
    });

    it('should be able to skip items with a custom predicate', () => {
      items = [
        { label: 'one' }, { label: 'two', skipItem: true }, { label: 'three' },
      ];

      const config = { skipPredicateFn: item => item.props.skipItem };

      rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

      expect(getActiveItemIndex()).toBe(0);

      fireEvent.keyDown(target, { keyCode: DOWN_ARROW });

      expect(getActiveItemIndex()).toBe(2);
    });
  });

  describe('typeahead mode', function () {
    let debounceInterval = 300;
    const config = { typeahead: debounceInterval };
    let target;

    beforeEach(function () {
      jest.useFakeTimers();
      // Lodash's debounce is more complicated than using normal timers since it uses
      // `Date.now()`. Mock the implementation by reverting to timeouts and delays.
      jest.spyOn(util, 'debounce').mockImplementation((callback, delay) => {
        let timeoutId = null;

        const debounced = jest.fn((...args) => {
          window.clearTimeout(timeoutId);
          timeoutId = window.setTimeout(() => callback(...args), delay)
        });

        debounced.cancel = jest.fn(() => {
          window.clearTimeout(timeoutId);
        });

        return debounced;
      });

      rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);
      target = rendered.queryByTestId(TestId.TEST_DIV);

      act(() => {
        setActiveItem(-1);
      });
    });

    afterEach(function () {
      jest.clearAllMocks();
      jest.useRealTimers();
    });

    it('should debounce the input key presses', function () {
      fireEvent.keyDown(target, { keyCode: 79, key: 'o' });
      fireEvent.keyDown(target, { keyCode: 78, key: 'n' });
      fireEvent.keyDown(target, { keyCode: 69, key: 'e' });

      expect(getActiveItemIndex()).not.toBe(0);

      jest.runOnlyPendingTimers();

      expect(getActiveItemIndex()).toBe(0);
    });

    it('should focus the first item that starts with a letter', function() {
      fireEvent.keyDown(target, { keyCode: 84, key: 't' });

      jest.runOnlyPendingTimers();

      expect(getActiveItemIndex()).toBe(1);
    });

    it('should not move focus if a modifier, that is not allowed, is pressed', function() {
      expect(getActiveItemIndex()).toBe(-1);

      fireEvent.keyDown(target, { keyCode: 84, key: 't', ctrlKey: true });
      jest.runOnlyPendingTimers();

      expect(getActiveItemIndex()).toBe(-1);
    });

    it('should always allow the shift key', function() {
      expect(getActiveItemIndex()).toBe(-1);

      fireEvent.keyDown(target, { keyCode: 84, key: 't', shiftKey: true });
      jest.runOnlyPendingTimers();

      expect(getActiveItemIndex()).toBe(1);
    });

    it('should focus the first item that starts with sequence of letters', function() {
      fireEvent.keyDown(target, { keyCode: 84, key: 't' });
      fireEvent.keyDown(target, { keyCode: 72, key: 'h' });

      jest.runOnlyPendingTimers();

      expect(getActiveItemIndex()).toBe(2);
    });

    it('should cancel any pending timers if a navigation key is pressed', function() {
      fireEvent.keyDown(target, { keyCode: 84, key: 't' });
      fireEvent.keyDown(target, { keyCode: 72, key: 'h' });
      fireEvent.keyDown(target, { keyCode: DOWN_ARROW });

      jest.runOnlyPendingTimers();

      expect(getActiveItemIndex()).toBe(0);
    });

    it('should handle non-English input', function() {
      items = [
        { label: 'едно' }, { label: 'две' }, { label: 'три' },
      ];

      rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

      fireEvent.keyDown(target, { keyCode: 68, key: 'д' });
      jest.runOnlyPendingTimers();

      expect(getActiveItemIndex()).toBe(1);
    });

    it('should handle non-letter characters', function() {
      items = [
        { label: '[]' }, { label: '321' }, { label: '`!?' },
      ];

      rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

      fireEvent.keyDown(target, { keyCode: 192, key: '`' });
      jest.runOnlyPendingTimers();
      expect(getActiveItemIndex()).toBe(2);

      fireEvent.keyDown(target, { keyCode: 51, key: '3' });
      jest.runOnlyPendingTimers();
      expect(getActiveItemIndex()).toBe(1);

      fireEvent.keyDown(target, { keyCode: 219, key: '[' });
      jest.runOnlyPendingTimers();
      expect(getActiveItemIndex()).toBe(0);
    });

    it('should not focus disabled items', function() {
      expect(getActiveItemIndex()).toBe(-1);

      items = [{ label: 'one', disabled: true }, { label: 'two' }, { label: 'three' }];
      rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

      fireEvent.keyDown(target, { keyCode: 79, key: 'o' });
      jest.runOnlyPendingTimers();

      expect(getActiveItemIndex()).toBe(-1);
    });

    it('should start looking for matches after the active item', function() {
      items = [
        { label: 'Bilbo' },
        { label: 'Frodo' },
        { label: 'Pippin' },
        { label: 'Boromir' },
        { label: 'Aragorn' },
      ];
      rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

      act(() => {
        setActiveItem(1);
      });

      fireEvent.keyDown(target, { keyCode: 66, key: 'b' });
      jest.runOnlyPendingTimers();

      expect(getActiveItemIndex()).toBe(3);
    });

    it('should wrap back around if there were no matches after the active item', function() {
      items = [
        { label: 'Bilbo' },
        { label: 'Frodo' },
        { label: 'Pippin' },
        { label: 'Boromir' },
        { label: 'Aragorn' },
      ];
      rendered.rerender(<Test config={config}>{ mapToItems(items) }</Test>);

      act(() => {
        setActiveItem(3);
      });

      fireEvent.keyDown(target, { keyCode: 66, key: 'b' });
      jest.runOnlyPendingTimers();

      expect(getActiveItemIndex()).toBe(0);
    });

    it('should wrap back around if the last item is active', function() {
      act(() => {
        setActiveItem(2);
      });

      fireEvent.keyDown(target, { keyCode: 66, key: 'o' });
      jest.runOnlyPendingTimers();

      expect(getActiveItemIndex()).toBe(0);
    });

    it('should be able to select the first item', function() {
      fireEvent.keyDown(target, { keyCode: 66, key: 'o' });
      jest.runOnlyPendingTimers();

      expect(getActiveItemIndex()).toBe(0);
    });

    it('should not do anything if there is no match', function() {
      act(() => {
        setActiveItem(1);
      });

      fireEvent.keyDown(target, { keyCode: 87, key: 'w' });
      jest.runOnlyPendingTimers();

      expect(getActiveItemIndex()).toBe(1);
    });

    it('should expose whether the user is currently typing', function() {
      expect(getManager('getIsTyping')).toBe(false);

      fireEvent.keyDown(target, { keyCode: 79, key: 'o' });

      expect(getManager('getIsTyping')).toBe(true);

      jest.runOnlyPendingTimers();

      expect(getManager('getIsTyping')).toBe(false);
    });
  });
});

function Test({ children, config }) {
  const manager = useListKeyManager(children, config);

  React.useEffect(() => {
    window.__manager__ = manager;

    return () => {
      delete window.__manager__;
    };
  }, [manager]);

  return (
    <div data-testid={TestId.TEST_DIV} onKeyDown={manager.onKeyDown}>
      <h1>Test</h1>
      { children }
    </div>
  );
}
