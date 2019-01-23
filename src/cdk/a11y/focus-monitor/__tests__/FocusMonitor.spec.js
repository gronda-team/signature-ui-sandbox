import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import {FocusMonitor, TOUCH_BUFFER_MS, withFocusMonitor} from '../exports';
import {Platform} from '../../../platform';
import {TAB} from '../../../../components/core/keys';

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
  let root; // root DIV to attach to document.body
  let wrapper;
  let focusMonitor;
  let buttonElement;
  let buttonElementNode;
  let monitorSpy;
  let stopMonitoringSpy;
  let changeHandlerSpy;

  beforeAll(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
    wrapper = mount(
      <Platform>
        <FocusMonitor>
          <FocusMonitorPlainButton />
        </FocusMonitor>
      </Platform>,
      // Must attach to root to ensure document captures the events
      { attachTo: root },
    );
  });

  beforeEach(() => {
    wrapper.mount();
    // Must use name because <FocusMonitor /> is a HOC
    focusMonitor = wrapper.find('FocusMonitor');

    monitorSpy = jest.spyOn(focusMonitor.instance(), 'monitor');
    stopMonitoringSpy = jest.spyOn(focusMonitor.instance(), 'stopMonitoring');

    buttonElement = wrapper.find('button');
    buttonElementNode = buttonElement.getDOMNode();
  });

  afterEach(() => {
    wrapper.unmount();
    jest.resetAllMocks();
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

  it('should detect focus via keyboard', () => {
    // Simulate focus via tabbing and then focusing
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: TAB,
    }));
    buttonElementNode.dispatchEvent(new Event('focus'));

    expect(buttonElementNode.getAttribute('data-focused')).toBe('true');
    expect(buttonElementNode.getAttribute('data-focus-origin')).toBe('keyboard');
  });

  it('should detect focus via mouse', () => {
    // Simulate focus via clicking on mouse and then focusing
    buttonElementNode.dispatchEvent(new Event('mousedown', {
      bubbles: true,
      cancelable: true,
    }));
    buttonElementNode.dispatchEvent(new Event('focus'));

    expect(buttonElementNode.getAttribute('data-focused')).toBe('true');
    expect(buttonElementNode.getAttribute('data-focus-origin')).toBe('mouse');
  });

  it('should detect focus via touch', () => {
    // Simulate focus via touch event on mobile
    jest.useFakeTimers();

    // calling new TouchEvent() will throw "Illegal constructor" error
    const touchEvent = document.createEvent('TouchEvent');

    touchEvent.initEvent('touchstart', true, true);

    buttonElementNode.dispatchEvent(touchEvent);
    buttonElementNode.dispatchEvent(new Event('focus'));
    jest.runTimersToTime(TOUCH_BUFFER_MS);

    expect(buttonElementNode.getAttribute('data-focused')).toBe('true');
    expect(buttonElementNode.getAttribute('data-focus-origin')).toBe('touch');
    jest.useRealTimers();
  });

  it('should detect programmatic focus', () => {
    buttonElementNode.focus();

    expect(buttonElementNode.getAttribute('data-focused')).toBe('true');
    expect(buttonElementNode.getAttribute('data-focus-origin')).toBe('program');
  });

  it('should simulate keyboard focus when using focusVia', () => {
    focusMonitor.instance().focusVia(buttonElementNode, 'keyboard');

    expect(buttonElementNode.getAttribute('data-focused')).toBe('true');
    expect(buttonElementNode.getAttribute('data-focus-origin')).toBe('keyboard');
  });

  it('should simulate mouse focus when using focusVia', () => {
    focusMonitor.instance().focusVia(buttonElementNode, 'mouse');

    expect(buttonElementNode.getAttribute('data-focused')).toBe('true');
    expect(buttonElementNode.getAttribute('data-focus-origin')).toBe('mouse');
  });

  it('should simulate touch focus when using focusVia', () => {
    focusMonitor.instance().focusVia(buttonElementNode, 'touch');

    expect(buttonElementNode.getAttribute('data-focused')).toBe('true');
    expect(buttonElementNode.getAttribute('data-focus-origin')).toBe('touch');
  });

  it('should simulate programmatic focus when using focusVia', () => {
    focusMonitor.instance().focusVia(buttonElementNode, 'program');

    expect(buttonElementNode.getAttribute('data-focused')).toBe('true');
    expect(buttonElementNode.getAttribute('data-focus-origin')).toBe('program');
  });

  it('should have falsy data attributes on blur', () => {
    buttonElementNode.focus();

    expect(buttonElementNode.getAttribute('data-focused')).toBe('true');
    expect(buttonElementNode.getAttribute('data-focus-origin')).toBe('program');

    buttonElementNode.blur();

    expect(buttonElementNode.getAttribute('data-focused')).toBe('false');
    expect(buttonElementNode.getAttribute('data-focus-origin')).toBe(null);
  });
});

/**
 * Rather than test a library component, this testable component
 * represents how most other library components interact with
 * the FocusMonitor, without any additional overhead.
 */
class PlainButton extends React.Component {
  constructor() {
    super();

    /** Keep track of focusOrigin */
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
        /** Invoke a callback to set this component's state */
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
