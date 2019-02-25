import * as React from 'react';
import _ from 'lodash';
import { mount } from 'enzyme';
import { Autocomplete } from '../exports';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { Option } from '../../core/option';
import {ARROW_DOWN} from '../../../cdk/keycodes/keys';
import SUIProvider from '../../core/SUIProvider';

describe('Autocomplete', () => {
  let root;
  let wrapper;
  let input;
  let overlay;
  let autocompleteExtension; // autocomplete behavior
  let ace; // instance for autocompleteExtension

  beforeAll(() => {
    /**
     * Must use fake timers because most of the components
     * involved (Overlays, etc.) handle asynchronous actions.
     */
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

  describe('Miscellaneous testing', () => {
    let wrapper;

    it('should be able to set a custom value for the `autocomplete` attribute', () => {
      wrapper = mount(<AutocompleteWithAutocompleteAttribute />);
      input = wrapper.find('input');
      console.log(input.debug());
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
              <Option value={state} key={state.code}>
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
          autocomplete="changed"
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
