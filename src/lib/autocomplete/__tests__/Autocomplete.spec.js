import * as React from 'react';
import _ from 'lodash';
import { mount } from 'enzyme';
import { Autocomplete } from '../exports';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { Option } from '../../core/option';
import {ARROW_DOWN, ARROW_UP, ENTER, ESCAPE, SPACE, TAB} from '../../../cdk/keycodes/keys';
import SUIProvider from '../../core/SUIProvider';

describe('Autocomplete', () => {
  let root;
  let wrapper;
  let input;
  let overlay;
  let panel;
  let autocompleteExtension; // autocomplete behavior
  let ace; // instance for autocompleteExtension
  let createKeyDownEvent;

  beforeAll(() => {
    /**
     * Must use fake timers because most of the components
     * involved (Overlays, etc.) handle asynchronous actions.
     */
    createKeyDownEvent = key => new KeyboardEvent('keydown', {
      key,
      cancelable: true,
      bubbles: true,
    });
    root = document.createElement('div');
    document.body.appendChild(root);
    jest.useFakeTimers();
    wrapper = mount(<SimpleAutocomplete />, {
      attachTo: root,
    });
  });

  beforeEach(() => {
    wrapper.mount();
    input = wrapper.find('input');
    overlay = wrapper.find('Overlay');
    panel = wrapper.find('Autocomplete');
    autocompleteExtension = wrapper.find('AutocompleteExtension');
    ace = autocompleteExtension.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('Panel toggling', () => {
    it('should open the panel when the input is focused', () => {
      expect(ace.getPanelOpen()).toBe(false);

      input.simulate('focus');
      jest.runOnlyPendingTimers();
      expect(ace.getPanelOpen()).toBe(true);
    });

    it('should not open the panel on input focus if it’s readOnly', () => {

      wrapper.setState({ readOnly: true });

      expect(ace.getPanelOpen()).toBe(false);
      input.simulate('focus');

      jest.runOnlyPendingTimers();
      // Should stay closed if we're read only
      expect(ace.getPanelOpen()).toBe(false);
    });

    it('should not open the panel using arrow keys when the input is readOnly', () => {
      wrapper.setState({ readOnly: true });

      expect(ace.getPanelOpen()).toBe(false);
      input.simulate('keydown', {
        key: ARROW_DOWN,
      });

      jest.runOnlyPendingTimers();
      // Should stay closed even if we have the keyboard down
      expect(ace.getPanelOpen()).toBe(false);
    });

    it('should open the panel programmatically', () => {
      expect(ace.getPanelOpen()).toBe(false);

      ace.openPanel();
      jest.runOnlyPendingTimers();
      expect(ace.getPanelOpen()).toBe(true);
      expect(overlay.text()).toContain('Alabama');
      expect(overlay.text()).toContain('California');
    });

    it('should close the panel when the user clicks away', () => {
      input.simulate('focus');
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(true);

      document.dispatchEvent(new Event('click'));
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(false);
      expect(overlay.text()).toBeFalsy();
    });

    it('should close the panel when the user taps away on a touch device', () => {
      input.simulate('focus');
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(true);

      document.dispatchEvent(new Event('touchend'));
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(false);
      expect(overlay.text()).toBeFalsy();
    });

    it('should close the panel when an option is clicked', () => {
      input.simulate('focus');
      jest.runOnlyPendingTimers();

      /**
       * We have to use a manually update here because after
       * running internal updates, autocomplete.debug() will
       * not show the wrappers present, despite it being on
       * autocomplete.html().
       *
       * Manually calling update seems to fix this issue.
       */
      wrapper.update();
      const option = wrapper.find('Option').at(0);
      option.simulate('click');
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(false);
      expect(overlay.text()).toBeFalsy();
    });

    it('should close the panel when a filtered option is clicked', () => {
      input.simulate('focus');
      jest.runOnlyPendingTimers();

      input.simulate('change', {
        target: { value: 'a' }
      });
      input.simulate('change', {
        target: { value: 'al' }
      }); // try typing Alabama or california

      expect(wrapper.state('value')).toEqual('al');

      wrapper.update();
      const alabama = wrapper.find('Option').at(0);
      alabama.simulate('click');
      jest.runOnlyPendingTimers();

      input.simulate('focus');
      jest.runOnlyPendingTimers();

      input.simulate('change', {
        target: { value: 'a' }
      });
      input.simulate('change', {
        target: { value: 'al' }
      }); // try typing California

      wrapper.update();
      const california = wrapper.find('Option').at(1);
      california.simulate('click');

      jest.runOnlyPendingTimers();

      expect(wrapper.state('value')).toBe('California');
      expect(ace.getPanelOpen()).toBe(false);
      expect(overlay.text()).toBeFalsy();
    });

    it('should close the panel programmatically', () => {
      ace.openPanel();
      jest.runOnlyPendingTimers();

      ace.closePanel();
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(false);
      expect(overlay.text()).toBeFalsy();
    });

    it('should hide the panel when the options list is empty', () => {
      input.simulate('focus');
      jest.runOnlyPendingTimers();
      expect(ace.getPanelOpen()).toBe(true);

      input.simulate('change', {
        target: { value: 'a' }
      });
      input.simulate('change', {
        target: { value: 'af' }
      }); // try getting a no-match

      expect(wrapper.state('value')).toEqual('af');
      expect(ace.getPanelOpen()).toBe(false);
    });

    it('should not open the panel when the value changes on a non-focused input', () => {
      expect(ace.getPanelOpen()).toBe(false);
      wrapper.setState({ value: 'Alabama' });

      jest.runOnlyPendingTimers();
      // It should remain closed
      expect(ace.getPanelOpen()).toBe(false);
    });

    it('should toggle the visibility when typing and closing the panel', () => {
      /**
       * In other words, the panel should hide any non-matching
       * results, but when we try typing again, it should show
       * the panel again.
       */
      ace.openPanel();
      jest.runOnlyPendingTimers();
      wrapper.update();
      expect(wrapper.find('[data-visible="true"]')).toBeTruthy();

      input.simulate('change', {
        target: { value: 'x' },
      });
      jest.runOnlyPendingTimers();
      wrapper.update();

      expect(ace.getPanelOpen()).toBe(false);

      ace.closePanel();
      jest.runOnlyPendingTimers();
      ace.openPanel();
      jest.runOnlyPendingTimers();

      input.simulate('change', {
        target: { value: 'al' },
      });

      jest.runOnlyPendingTimers();
      wrapper.update();

      expect(wrapper.find('[data-visible="true"]')).toBeTruthy();
    });

    it('should provide the open state of the panel', () => {
      expect(ace.getPanelOpen()).toBe(false);

      input.simulate('focus');
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(true);
    });

    it('should emit an event when the panel is opened', () => {
      const spy = jest.fn();
      wrapper.setState({ onOpen: spy });

      input.simulate('focus');
      jest.runOnlyPendingTimers();

      expect(spy).toHaveBeenCalled();
    });

    it('should not emit the `onOpen` event when no options are shown', () => {
      const spy = jest.fn();
      // Set the value without dispatching an input event
      wrapper.setState({ value: 'xyz', onOpen: spy });

      input.simulate('focus');
      jest.runOnlyPendingTimers();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit the `onOpen` event multiple times while typing', () => {
      const spy = jest.fn();
      wrapper.setState({ onOpen: spy });

      ace.openPanel();
      jest.runOnlyPendingTimers();

      expect(spy).toHaveBeenCalledTimes(1);
      input.simulate('change', {
        target: { value: 'Alabam' },
      });
      jest.runOnlyPendingTimers();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit an event when the panel is closed', () => {
      const spy = jest.fn();
      wrapper.setState({ onClose: spy });

      ace.openPanel();
      jest.runOnlyPendingTimers();

      ace.closePanel();
      jest.runOnlyPendingTimers();

      expect(spy).toHaveBeenCalled();
    });

    it('should not emit the `onClose` event when no options are shown', () => {
      const spy = jest.fn();
      wrapper.setState({ onClose: spy, value: 'xyz' });

      ace.openPanel();
      jest.runOnlyPendingTimers();
      ace.closePanel();
      jest.runOnlyPendingTimers();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not be able to open the panel if the autocomplete is disabled', () => {
      expect(ace.getPanelOpen()).toBe(false);

      wrapper.setState({ autocompleteDisabled: true });

      input.simulate('focus');
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(false);
    });
  });

  describe('Bidi, LTR and RTL contexts', () => {
    /**
     * Check the bidirectionality capabilities
     * of the panel. Ensure that the components
     * can react accordingly when the `dir` attribute
     * is set.
     */
    it('should have the correct text direction in RTL', () => {
      wrapper.setState({ dir: 'rtl' });
      ace.openPanel();
      jest.runOnlyPendingTimers();
      wrapper.update();

      const boundingBox = document.querySelector('[data-overlay-role="bounding-box"]');
      expect(boundingBox).toBeTruthy();
      expect(boundingBox.getAttribute('dir')).toEqual('rtl');
    });

    it('should update the panel direction if it changes', () => {
      wrapper.setState({ dir: 'rtl' });
      ace.openPanel();
      jest.runOnlyPendingTimers();
      wrapper.update();

      let boundingBox = document.querySelector('[data-overlay-role="bounding-box"]');
      expect(boundingBox).toBeTruthy();
      expect(boundingBox.getAttribute('dir')).toEqual('rtl');

      ace.closePanel();
      jest.runOnlyPendingTimers();

      wrapper.setState({ dir: 'ltr' });
      ace.openPanel();
      jest.runOnlyPendingTimers();
      wrapper.update();

      boundingBox = document.querySelector('[data-overlay-role="bounding-box"]');
      expect(boundingBox).toBeTruthy();
      expect(boundingBox.getAttribute('dir')).toEqual('ltr');
    });
  });

  describe('Keyboard events', () => {
    let downEvent;
    let upEvent;
    let enterEvent;

    beforeEach(() => {
      downEvent = createKeyDownEvent(ARROW_DOWN);
      upEvent = createKeyDownEvent(ARROW_UP);
      enterEvent = createKeyDownEvent(ENTER);

      ace.openPanel();
      jest.runOnlyPendingTimers();
      wrapper.update();
    });

    it('should not focus the option when the DOWN key is pressed', () => {
      const option = wrapper.find('Option').at(0);
      const optionNode = option.getDOMNode();
      const focusSpy = jest.spyOn(optionNode, 'focus');

      ace.onKeyDown(downEvent);
      jest.runOnlyPendingTimers();
      expect(focusSpy).not.toHaveBeenCalled();
    });

    it('should not close the panel when the DOWN key is pressed', () => {
      ace.onKeyDown(downEvent);
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(true);
      expect(overlay.text()).toContain('Alabama');
      expect(overlay.text()).toContain('California');
    });

    it('should set the active item to the first option when the DOWN key is pressed', () => {
      expect(ace.getPanelOpen()).toBe(true);

      ace.onKeyDown(downEvent);
      jest.runOnlyPendingTimers();

      expect(ace.getActiveOption().props.value).toEqual({ code: 'AL', name: 'Alabama' });

      const options = wrapper.find('Option');
      expect(options.at(0).getDOMNode().getAttribute('data-active')).toBe('true');
      expect(options.at(1).getDOMNode().getAttribute('data-active')).toBe('false');
    });

    it('should set the active item to the last option when the UP key is pressed', () => {
      expect(ace.getPanelOpen()).toBe(true);

      ace.onKeyDown(upEvent);
      jest.runOnlyPendingTimers();

      expect(ace.getActiveOption().props.value).toEqual({ code: 'WY', name: 'Wyoming' });

      const options = wrapper.find('Option');
      const count = options.length;
      expect(options.at(count - 1).getDOMNode().getAttribute('data-active')).toBe('true');
      expect(options.at(count - 2).getDOMNode().getAttribute('data-active')).toBe('false');
    });

    it('should set the active item properly after filtering', () => {
      wrapper.setState({ value: 'o' });
      ace.onKeyDown(downEvent);
      jest.runOnlyPendingTimers();

      expect(ace.getActiveOption().props.value).toEqual({ code: 'CA', name: 'California' });

      const options = wrapper.find('Option');
      expect(options.at(0).getDOMNode().getAttribute('data-active')).toBe('true');
      expect(options.at(1).getDOMNode().getAttribute('data-active')).toBe('false');
    });

    it('should fill the text field when an option is selected with ENTER', () => {
      ace.onKeyDown(downEvent);
      jest.runOnlyPendingTimers();

      expect(ace.getActiveOption().props.value).toEqual({ code: 'AL', name: 'Alabama' });

      ace.onKeyDown(enterEvent);
      jest.runOnlyPendingTimers();
      wrapper.update();

      expect(wrapper.state().value).toContain('Alabama');
    });

    it('should prevent the default enter key action', () => {
      ace.onKeyDown(downEvent);
      jest.runOnlyPendingTimers();

      ace.onKeyDown(enterEvent);
      jest.runOnlyPendingTimers();

      expect(enterEvent.defaultPrevented).toBe(true);
    });

    it('should not prevent the default enter action for a closed panel after a user action', () => {
      ace.onKeyDown(upEvent);
      jest.runOnlyPendingTimers();

      ace.closePanel();
      jest.runOnlyPendingTimers();
      wrapper.update();

      ace.onKeyDown(enterEvent);
      jest.runOnlyPendingTimers();

      expect(enterEvent.defaultPrevented).toBe(false);
    });

    it('should fill the text field, not select an option, when SPACE is entered', () => {
      // Type in New _ York
      wrapper.setState({ value: 'New' });
      const spaceEvent = createKeyDownEvent(SPACE);

      ace.onKeyDown(downEvent);
      jest.runOnlyPendingTimers();

      ace.onKeyDown(spaceEvent);
      jest.runOnlyPendingTimers();

      expect(wrapper.state('value')).not.toContain('New York');
    });

    it.skip('should call the parent form’s onDirty method when selecting an option from the keyboard', () => {
      /**
       * Todo (There is no <Form /> component just yet.)
       */
    });

    it('should open the panel again when typing after making a selection', () => {
      ace.onKeyDown(downEvent);
      jest.runOnlyPendingTimers();

      ace.onKeyDown(enterEvent);
      jest.runOnlyPendingTimers();
      wrapper.update();

      expect(ace.getPanelOpen()).toBe(false);
      expect(overlay.text()).toBeFalsy();

      input.simulate('focus');
      jest.runOnlyPendingTimers();
      input.simulate('change', {
        target: { value: 'al' }
      });
      jest.runOnlyPendingTimers();
      wrapper.update();

      expect(ace.getPanelOpen()).toBe(true);
      expect(overlay.text()).toContain('Alabama');
    });

    it('should not open the panel with a blank onChange event', () => {
      /**
       * The original Angular implementation used the onInput event
       * rather than the React-recommended onChange event. This suite
       * was originally set up ensure that some IE quirks would not
       * open the panel. (The IE quirk in question was that a blank
       * input event would fire). This test is kept here for
       * completeness.
       */
      input.simulate('focus');
      jest.runOnlyPendingTimers();
      input.simulate('change', {
        target: { value: 'A' },
      });
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(true);
      ace.closePanel();
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(false);

      /** Dispatch the false input event */
      input.simulate('change', {
        target: { value: 'A' },
      });
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(false);
    });

    it('should scroll to active options below the fold', () => {
      ace.onKeyDown(downEvent);
      jest.runOnlyPendingTimers();

      // Should not scroll
      expect(panel.instance().state.scrollTop).toBe(0);

      // Simulate down events to go below the fold
      _.times(5, () => ace.onKeyDown(downEvent));
      jest.runOnlyPendingTimers();

      expect(panel.instance().state.scrollTop).toBeGreaterThan(0);
    });

    it('should scroll to active options on UP arrow', () => {
      ace.onKeyDown(upEvent);
      jest.runOnlyPendingTimers();

      expect(panel.instance().state.scrollTop).toBeGreaterThan(0);
    });

    it('should not scroll to active options that are fully in the panel', () => {
      ace.onKeyDown(downEvent);
      jest.runOnlyPendingTimers();

      expect(panel.instance().state.scrollTop).toBe(0);

      // Simulate down events to go below the fold
      _.times(5, () => ace.onKeyDown(downEvent));
      jest.runOnlyPendingTimers();

      const scrollTop = panel.instance().state.scrollTop;
      expect(scrollTop).toBeGreaterThan(0);

      // Set the second item active (which is still visible in the panel)
      _.times(4, () => ace.onKeyDown(upEvent));
      jest.runOnlyPendingTimers();

      expect(panel.instance().state.scrollTop).toBe(scrollTop);
    });

    it('should scroll to active options that are above the panel', () => {
      ace.onKeyDown(downEvent);
      jest.runOnlyPendingTimers();

      expect(panel.instance().state.scrollTop).toBe(0);

      // Simulate down events to go below the fold
      _.times(6, () => ace.onKeyDown(downEvent));
      jest.runOnlyPendingTimers();

      // Set the second item active (which is still visible in the panel)
      _.times(5, () => ace.onKeyDown(upEvent));
      jest.runOnlyPendingTimers();

      expect(panel.instance().state.scrollTop).toBeGreaterThan(0);
    });

    it('should close the panel when pressing ESCAPE', () => {
      input.simulate('focus');
      // must trigger focus manually to query document.activeElement
      input.getDOMNode().focus();
      jest.runOnlyPendingTimers();

      expect(document.activeElement.nodeName).toBe('INPUT');
      expect(ace.getPanelOpen()).toBe(true);

      document.body.dispatchEvent(createKeyDownEvent(ESCAPE));
      jest.runOnlyPendingTimers();

      expect(document.activeElement.nodeName).toBe('INPUT');
      expect(ace.getPanelOpen()).toBe(false);
    });

    it('should prevent the default action when pressing ESCAPE', () => {
      const escapeEvent = createKeyDownEvent(ESCAPE);
      input.getDOMNode().dispatchEvent(escapeEvent);

      expect(escapeEvent.defaultPrevented).toBe(true);
    });

    it('should close the panel when pressing ALT + UP_ARROW', () => {
      // Update the event to use the alt key as well
      Object.defineProperty(upEvent, 'altKey', { get: () => true });

      input.simulate('focus');
      jest.runOnlyPendingTimers();
      // Simulate focus
      input.getDOMNode().focus();

      expect(document.activeElement.nodeName).toBe('INPUT');
      expect(ace.getPanelOpen()).toBe(true);

      document.body.dispatchEvent(upEvent); // up + alt
      jest.runOnlyPendingTimers();

      // Input should still be focused
      expect(document.activeElement.nodeName).toBe('INPUT');
      expect(ace.getPanelOpen()).toBe(false);
    });

    it.skip('should close the panel when tabbing away from a trigger without results', () => {
      /**
       * Skip this test because I'm not exactly sure how this is supposed to
       * work.
       */
      wrapper.setState({ states: [] });
      input.simulate('focus');
      jest.runOnlyPendingTimers();
      wrapper.update();

      expect(ace.getPanelOpen()).toBe(true);

      input.getDOMNode().dispatchEvent(createKeyDownEvent(TAB));
      jest.runOnlyPendingTimers();
      wrapper.update();

      expect(ace.getPanelOpen()).toBe(false);
    });

    it('should reset the active option when closing with the ESCAPE key', () => {
      ace.openPanel();
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(true);
      expect(ace.getActiveOption()).toBeFalsy();

      // Press the down arrow a few times
      _.times(3, () => ace.onKeyDown(downEvent));
      jest.runOnlyPendingTimers();

      expect(ace.getActiveOption()).toBeTruthy();

      // Dispatch an escape event
      document.body.dispatchEvent(createKeyDownEvent(ESCAPE));
      jest.runOnlyPendingTimers();

      expect(ace.getActiveOption()).toBeFalsy();
    });

    it('should reset the active option when closing via selection with ENTER', () => {
      ace.openPanel();
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(true);
      expect(ace.getActiveOption()).toBeFalsy();

      // Press the arrow key a few times
      _.times(3, () => ace.onKeyDown(downEvent));
      jest.runOnlyPendingTimers();

      expect(ace.getActiveOption()).toBeTruthy();

      ace.onKeyDown(enterEvent);
      jest.runOnlyPendingTimers();

      expect(ace.getActiveOption()).toBeFalsy();
    });
  });

  describe.skip('Option groups', () => {
    /**
     * Todo: implement tests when we have an <OptionGroup /> component
     */
  });

  describe('ARIA', () => {
    let inputInstance;
    let downEvent;
    beforeEach(() => {
      inputInstance = input.getDOMNode();
      downEvent = createKeyDownEvent(ARROW_DOWN);
    });

    it('should set input[role=combobox]', () => {
      expect(inputInstance.getAttribute('role')).toEqual('combobox');
    });

    it('should set the autocomplete panel’s role to listbox', () => {
      ace.openPanel();
      jest.runOnlyPendingTimers();
      wrapper.update();
      const acPanel = wrapper.find('AutocompletePanel');

      expect(acPanel.getDOMNode().getAttribute('role')).toEqual('listbox');
    });

    it('should set aria-autocomplete to list', () => {
      expect(inputInstance.getAttribute('aria-autocomplete')).toEqual('list');
    });

    it('should set aria-activedescendant based on the active option', () => {
      ace.openPanel();
      jest.runOnlyPendingTimers();

      expect(inputInstance.hasAttribute('aria-activedescendant')).toBe(false);

      ace.onKeyDown(downEvent);
      jest.runOnlyPendingTimers();

      expect(inputInstance.getAttribute('aria-activedescendant')).toEqual('AL');

      ace.onKeyDown(downEvent);
      jest.runOnlyPendingTimers();

      expect(inputInstance.getAttribute('aria-activedescendant')).toEqual('CA');
    });

    it('should set aria-expanded based on whether the panel is open', () => {
      expect(inputInstance.getAttribute('aria-expanded')).toBe('false');

      ace.openPanel();
      jest.runOnlyPendingTimers();

      expect(inputInstance.getAttribute('aria-expanded')).toBe('true');
    });

    it('should set aria-expanded properly when the panel is hidden', () => {
      ace.openPanel();
      jest.runOnlyPendingTimers();

      expect(inputInstance.getAttribute('aria-expanded')).toBe('true');

      input.simulate('change', {
        target: { value: 'zz' }, // does not match any of the states
      });
      jest.runOnlyPendingTimers();

      expect(inputInstance.getAttribute('aria-expanded')).toBe('false');
    });

    it('should set aria-owns based on the attached autocomplete', () => {
      ace.openPanel();
      jest.runOnlyPendingTimers();
      wrapper.update();

      expect(inputInstance.getAttribute('aria-owns')).toBe(
        panel.getDOMNode().getAttribute('id')
      );
    });

    it('should not set aria-owns when the autocomplete is closed', () => {
      expect(inputInstance.getAttribute('aria-owns')).toBeFalsy();

      ace.openPanel();

      expect(inputInstance.getAttribute('aria-owns')).toBeTruthy();
    });

    it('should restore focus to the input when clicking to select a value', () => {
      ace.openPanel();
      jest.runOnlyPendingTimers();
      wrapper.update();

      const option = wrapper.find('Option').at(0);
      option.simulate('focus');
      option.simulate('click');
      jest.runOnlyPendingTimers();

      expect(document.activeElement.nodeName).toBe('INPUT');
    });

    it('should remove autocomplete-specific aria attributes when autocomplete is disabled', () => {
      wrapper.setState({ autocompleteDisabled: true });
      jest.runOnlyPendingTimers();

      expect(inputInstance.getAttribute('role')).toBeFalsy();
      expect(inputInstance.getAttribute('aria-autocomplete')).toBeFalsy();
      expect(inputInstance.getAttribute('aria-expanded')).toBeFalsy();
      expect(inputInstance.getAttribute('aria-owns')).toBeFalsy();
    })
  });

  describe('Miscellaneous testing', () => {
    let wrapper;

    it('should be able to set a custom value for the `autocomplete` attribute', () => {
      wrapper = mount(<AutocompleteWithAutocompleteAttribute />);
      input = wrapper.find('input');
      expect(input.getDOMNode().getAttribute('autocomplete')).toBe('changed');
    });

    it('should not throw when typing in an element with a null + disabled autocomplete', () => {
      wrapper = mount(<InputWithoutAutocompleteAndDisabled />);

      expect(() => {
        input = wrapper.find('input');
        input
          .getDOMNode()
          .dispatchEvent(new KeyboardEvent('keydown', {
            cancelable: true,
            bubbles: true,
            key: ' ',
          }));
      }).not.toThrow();
    });
  });
});

class SimpleAutocomplete extends React.Component {
  constructor() {
    super();

    this.state = {
      states: [
        { code: 'AL', name: 'Alabama' },
        { code: 'CA', name: 'California' },
        { code: 'FL', name: 'Florida' },
        { code: 'KS', name: 'Kansas' },
        { code: 'MA', name: 'Massachusetts' },
        { code: 'NY', name: 'New York' },
        { code: 'OR', name: 'Oregon' },
        { code: 'PA', name: 'Pennsylvania' },
        { code: 'TN', name: 'Tennessee' },
        { code: 'VA', name: 'Virginia' },
        { code: 'WY', name: 'Wyoming' },
      ],
      value: '',
      onOpen: _.noop,
      onClose: _.noop,
      readOnly: false,
      autocompleteDisabled: false,
      dir: 'ltr',
    };
  }

  onChange = (event) => {
    this.setState({ value: event.target.value });
  };

  getFilteredStates = () => {
    const value = this.state.value;
    if (!value) return this.state.states;
    return this.state.states
      .filter(state => state.name.match(new RegExp(value, 'gi')));
  };

  displayFn = value => value ? value.name : value;

  render() {
    return (
      <SUIProvider>
        <FormField>
          <Input
            readOnly={this.state.readOnly}
            placeholder="State"
            autocompleteAttribute="auto"
            autocompleteDisabled={this.state.autocompleteDisabled}
            value={this.state.value}
            onChange={this.onChange}
            extensions={['autocomplete']}
          />
          <Autocomplete
            displayWith={this.displayFn}
            onOpen={this.state.onOpen}
            onClose={this.state.onClose}
            dir={this.state.dir}
          >
            { this.getFilteredStates().map(state => (
              <Option value={state} key={state.code} id={state.code}>
                { state.name }
              </Option>
            )) }
          </Autocomplete>
        </FormField>
      </SUIProvider>
    );
  }
}

function AutocompleteWithAutocompleteAttribute(props) {
  return (
    <SUIProvider>
      <FormField>
        <Input
          autocompleteAttribute="changed"
          value={props.value}
          extensions={['autocomplete']}
        />
        <Autocomplete />
      </FormField>
    </SUIProvider>
  )
}

function InputWithoutAutocompleteAndDisabled() {
  return (
    <SUIProvider>
      <FormField>
        <Input
          autocomplete="changed"
          autocompleteDisabled
          extensions={['autocomplete']}
        />
      </FormField>
    </SUIProvider>
  )
}
