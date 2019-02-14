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

describe('Autocomplete', () => {
  describe('Panel toggling', () => {
    let wrapper;
    let input;
    let overlay;
    let autocompleteExtension; // autocomplete behavior

    beforeAll(() => {
      /**
       * Must use fake timers because most of the components
       * involved (Overlays, etc.) handle asynchronous actions.
       */
      jest.useFakeTimers();
      wrapper = mount(<SimpleAutocomplete />);
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
      jest.runAllTimers();
      expect(ace.getPanelOpen()).toBe(true);
    });

    it('should not open the panel on input focus if it’s readOnly', () => {
      const ace = autocompleteExtension.instance(); // = AutoCompleteExtension

      wrapper.setState({ readOnly: true });

      expect(ace.getPanelOpen()).toBe(false);
      input.simulate('focus');

      jest.runAllTimers();
      // Should stay closed if we're read only
      expect(ace.getPanelOpen()).toBe(false);
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
                        onOpen={this.props.onOpen}
                        onClose={this.props.onClose}
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
