import React from 'react';
import { mount } from 'enzyme';
import { FocusTrap, InteractivityChecker } from '../../exports';
import { Platform } from '../../../platform';

/**
 * This test is temporarily disabled until we figure
 * out a way to test InteractivityChecker.isVisible
 * in Jest.
 */
describe.skip('FocusTrap', () => {
  describe('With default element', () => {
    let wrapper;
    let focusTrap;
    let ft;

    beforeAll(() => {
      wrapper = mount(<SimpleFocusTrap />);
    });

    beforeEach(() => {
      wrapper.mount();
      focusTrap = wrapper.find('FocusTrap');
      ft = focusTrap.instance();
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should wrap focus from end to start', () => {
      /**
       * Can't mimic a real tab press in a unit test.
       */
      const result = ft.focusFirstTabbableElement();
      // Expect the input to be focused.
      expect(document.activeElement.nodeName.toLowerCase()).toBe('input');
      expect(result).toBe(true);
    });
  });
});

class SimpleFocusTrap extends React.Component {
  constructor() {
    super();

    this.focusRegion = React.createRef();
  }

  render() {
    return (
      <Platform>
        <InteractivityChecker>
          <div>
            <FocusTrap
              element={this.focusRegion.current}
            />
            <div ref={this.focusRegion}>
              <input />
              <button>Save</button>
            </div>
          </div>
        </InteractivityChecker>
      </Platform>
    );
  }
}
