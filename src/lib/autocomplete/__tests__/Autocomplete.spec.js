import * as React from 'react';
import _ from 'lodash';
import { mount } from 'enzyme';
import { Autocomplete } from '../exports';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { Option } from '../../core/option';
import { Platform } from '../../../cdk/platform';
import ViewportRuler from '../../../cdk/scrolling/ViewportRuler';
import ScrollDispatcher from '../../../cdk/scrolling/ScrollDispatcher';
import { OverlayContainer } from '../../../cdk/overlay';
import { FocusMonitor } from '../../../cdk/a11y';
import { AutofillMonitor } from '../../../cdk/text-area';
import {ARROW_DOWN} from '../../../cdk/keycodes/keys';

describe('Autocomplete', () => {
  describe('Panel toggling', () => {
    let root;
    let wrapper;
    let input;
    let overlay;
    let autocompleteExtension; // autocomplete behavior

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
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should open the panel when the input is focused', () => {
      const ace = autocompleteExtension.instance(); // = AutoCompleteExtension
      expect(ace.getPanelOpen()).toBe(false);

      input.simulate('focus');
      jest.runOnlyPendingTimers();
      expect(ace.getPanelOpen()).toBe(true);
    });

    it('should not open the panel on input focus if it’s readOnly', () => {
      const ace = autocompleteExtension.instance(); // = AutoCompleteExtension

      wrapper.setState({ readOnly: true });

      expect(ace.getPanelOpen()).toBe(false);
      input.simulate('focus');

      jest.runOnlyPendingTimers();
      // Should stay closed if we're read only
      expect(ace.getPanelOpen()).toBe(false);
    });

    it('should not open the panel using arrow keys when the input is readOnly', () => {
      const ace = autocompleteExtension.instance();
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
      const ace = autocompleteExtension.instance();

      expect(ace.getPanelOpen()).toBe(false);

      ace.openPanel();
      jest.runOnlyPendingTimers();
      expect(ace.getPanelOpen()).toBe(true);
      expect(overlay.text()).toContain('Alabama');
      expect(overlay.text()).toContain('California');
    });

    it('should close the panel when the user clicks away', () => {
      const ace = autocompleteExtension.instance();

      input.simulate('focus');
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(true);

      document.dispatchEvent(new Event('click'));
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(false);
      expect(overlay.text()).toBeFalsy();
    });

    it('should close the panel when the user taps away on a touch device', () => {
      const ace = autocompleteExtension.instance();

      input.simulate('focus');
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(true);

      document.dispatchEvent(new Event('touchend'));
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(false);
      expect(overlay.text()).toBeFalsy();
    });

    it('should close the panel when an option is clicked', () => {
      const ace = autocompleteExtension.instance();

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
      const ace = autocompleteExtension.instance();

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
      const ace = autocompleteExtension.instance();

      ace.openPanel();
      jest.runOnlyPendingTimers();

      ace.closePanel();
      jest.runOnlyPendingTimers();

      expect(ace.getPanelOpen()).toBe(false);
      expect(overlay.text()).toBeFalsy();
    });

    it('should hide the panel when the options list is empty', () => {
      const ace = autocompleteExtension.instance();

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
      const ace = autocompleteExtension.instance();
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
      const ace = autocompleteExtension.instance();

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
      const ace = autocompleteExtension.instance();
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
      <Platform>
        <ViewportRuler>
          <ScrollDispatcher>
            <OverlayContainer>
              <FocusMonitor>
                <AutofillMonitor>
                  <React.Fragment>
                    <FormField>
                      <Input
                        readOnly={this.state.readOnly}
                        placeholder="State"
                        autocompleteAttribute="auto"
                        autocompleteDisabled={this.props.autocompleteDisabled}
                        value={this.state.value}
                        onChange={this.onChange}
                        extensions={['autocomplete']}
                      />
                      <Autocomplete
                        displayWith={this.displayFn}
                        onOpen={this.state.onOpen}
                        onClose={this.state.onClose}
                      >
                        { this.getFilteredStates().map(state => (
                          <Option value={state} key={state.code}>
                            { state.name }
                          </Option>
                        )) }
                      </Autocomplete>
                    </FormField>
                  </React.Fragment>
                </AutofillMonitor>
              </FocusMonitor>
            </OverlayContainer>
          </ScrollDispatcher>
        </ViewportRuler>
      </Platform>
    );
  }
}
