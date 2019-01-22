import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import { FocusMonitor, withFocusMonitor } from '../exports';
import {Platform} from '../../../platform';

describe('FocusMonitor smoke test', () => {
  it('should render without problems', () => {
    const div = document.createElement('div');
    ReactDOM.render((
      <Platform>
        <FocusMonitor>
          <FocusMonitorPlainButton />
        </FocusMonitor>
      </Platform>
    ), div);
  });
});

describe('FocusMonitor', () => {
  let wrapper;
  let focusMonitor;
  let buttonElement;
  let buttonElementNode;
  let monitorSpy;
  let stopMonitoringSpy;
  let changeHandlerSpy;

  beforeEach(() => {
    wrapper = mount(
      <Platform>
        <FocusMonitor>
          <FocusMonitorPlainButton />
        </FocusMonitor>
      </Platform>
    );

    // Must use name because <FocusMonitor /> is a HOC
    focusMonitor = wrapper.find('FocusMonitor');

    monitorSpy = jest.spyOn(focusMonitor.instance(), 'monitor');
    stopMonitoringSpy = jest.spyOn(focusMonitor.instance(), 'stopMonitoring');

    changeHandlerSpy = jest.spyOn(
      wrapper.find('PlainButton').instance(),
      'setFocusOrigin'
    );

    buttonElement = wrapper.find('button');
    buttonElementNode = buttonElement.getDOMNode();
  });

  afterEach(() => {
    if (monitorSpy) { monitorSpy.mockRestore(); }
    if (stopMonitoringSpy) { stopMonitoringSpy.mockRestore(); }
    if (changeHandlerSpy) { changeHandlerSpy.mockRestore(); }
  });

  it('should handle focus for monitored elements', () => {
    /*
    We must use dispatchEvent instead of wrapper.simulate() because
    monitor uses addEventListener (rather than JSX) to add
    the focus monitor stuff.
     */
    buttonElementNode.dispatchEvent(new Event('focus'));
    expect(buttonElementNode.getAttribute('data-focused')).toBe('true');
  });
});

class PlainButton extends React.Component {
  constructor() {
    super();

    this.state = { focusOrigin: null };
  }

  componentWillUnmount() {
    this.props.__focusMonitor.stopMonitoring(this.BUTTON);
  }

  getButtonRef = (button) => {
    this.BUTTON = button;
    if (button) {
      this.props.__focusMonitor.monitor({
        element: button,
        callback: this.setFocusOrigin,
      });
    }
  };

  setFocusOrigin = (origin) => {
    this.setState({ focusOrigin: origin });
  };

  render() {
    return (
      <button
        data-focused={!!this.state.focusOrigin}
        data-focus-origin={this.state.focusOrigin}
        ref={this.getButtonRef}
      >Hello</button>
    );
  }
}

const FocusMonitorPlainButton = withFocusMonitor(PlainButton);
