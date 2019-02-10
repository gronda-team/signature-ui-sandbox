import * as React from 'react';
import _ from 'lodash';
import { mount } from 'enzyme';
import {
  AutofillMonitor,
  AUTOFILL_ANIMATION_END,
  AUTOFILL_ANIMATION_START,
} from '../exports';
import {Platform} from '../../platform';

describe('AutofillMonitor', () => {
  let autofillMonitor;
  let wrapper;
  let inputs;

  beforeAll(() => {
    wrapper = mount(<Inputs hasAutofill />);
  });

  beforeEach(() => {
    wrapper.mount();
    wrapper.setProps({ hasAutofill: true });
    autofillMonitor = wrapper.find('AutofillMonitor');
    inputs = wrapper.find('input');

    inputs.forEach((input) => {
      let inputEl = input.getDOMNode();

      // Apply addEventListener spies
      jest.spyOn(inputEl, 'addEventListener');
      jest.spyOn(inputEl, 'removeEventListener');
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should add monitored data attribute to input after monitoring', () => {
    const inputEl = inputs.at(0).getDOMNode();
    expect(inputEl.addEventListener).not.toHaveBeenCalled();

    autofillMonitor.instance().monitor({
      id: _.uniqueId(),
      element: inputEl,
    });

    expect(wrapper.find('[data-autofill-monitored="true"]')).toBeTruthy();
    expect(inputEl.getAttribute('data-autofill-monitored')).toBe('true');
    expect(inputEl.addEventListener).toHaveBeenCalled();
  });

  it('should not add multiple listeners to the same element', () => {
    const inputEl = inputs.at(0).getDOMNode();
    expect(inputEl.addEventListener).not.toHaveBeenCalled();

    const afm = autofillMonitor.instance();

    afm.monitor({ id: _.uniqueId(), element: inputEl });
    afm.monitor({ id: _.uniqueId(), element: inputEl });

    expect(inputEl.addEventListener).toHaveBeenCalledTimes(1);
  });

  it('should remove monitored class and listener upon stopMonitor', () => {
    const inputEl = inputs.at(0).getDOMNode();
    const afm = autofillMonitor.instance();

    const id = _.uniqueId();
    afm.monitor({ id, element: inputEl });
    expect(inputEl.getAttribute('data-autofill-monitored')).toBe('true');
    expect(inputEl.removeEventListener).not.toHaveBeenCalled();

    afm.stopMonitoring(id);
    expect(inputEl.hasAttribute('data-autofill-monitored')).toBe(false);
    expect(inputEl.removeEventListener).toHaveBeenCalled();
  });

  it('should stop monitoring all monitored elements upon destroy', () => {
    const afm = autofillMonitor.instance();
    inputs.forEach((input) => {
      const inputEl = input.getDOMNode();
      afm.monitor({ element: inputEl, id: _.uniqueId() });

      expect(inputEl.removeEventListener).not.toHaveBeenCalled();
    });

    wrapper.setProps({ hasAutofill: false });

    inputs.forEach((input) => {
      const inputEl = input.getDOMNode();
      expect(inputEl.removeEventListener).toHaveBeenCalled();
    });
  });

  it('should emit and add filled class upon start animation', () => {
    const inputEl = inputs.at(0).getDOMNode();
    let animationStartCallback = () => {};
    const autofillStream = jest.fn(({ isAutofilled }) => {
      inputEl.setAttribute('data-autofilled', isAutofilled);
    });
    /** Can't construct new AnimationEvent(), so we have to tap into listener */
    inputEl.addEventListener.mockImplementation((_, cb) => animationStartCallback = cb);
    const afm = autofillMonitor.instance();

    afm.monitor({
      element: inputEl,
      callback: autofillStream,
    });

    expect(autofillStream).not.toHaveBeenCalled();
    expect(inputEl.getAttribute('data-autofilled')).toBeFalsy();

    animationStartCallback({
      animationName: AUTOFILL_ANIMATION_START,
      target: inputEl,
    });

    expect(autofillStream).toHaveBeenCalledWith({ target: inputEl, isAutofilled: true });
    expect(inputEl.getAttribute('data-autofilled')).toBe('true');
  });

  it('should emit and remove filled class upon end animation', () => {
    const inputEl = inputs.at(0).getDOMNode();
    let animationStartCallback = () => {};
    const autofillStream = jest.fn(({ isAutofilled }) => {
      inputEl.setAttribute('data-autofilled', isAutofilled);
    });
    /** Can't construct new AnimationEvent(), so we have to tap into listener */
    inputEl.addEventListener.mockImplementation((_, cb) => animationStartCallback = cb);
    const afm = autofillMonitor.instance();

    afm.monitor({ element: inputEl, callback: autofillStream });

    animationStartCallback({
      animationName: AUTOFILL_ANIMATION_START,
      target: inputEl,
    });

    expect(inputEl.getAttribute('data-autofilled')).toBe('true');
    expect(autofillStream).toHaveBeenCalledWith({ target: inputEl, isAutofilled: true });

    animationStartCallback({
      animationName: AUTOFILL_ANIMATION_END,
      target: inputEl,
    });

    expect(inputEl.getAttribute('data-autofilled')).toBe('false');
    expect(autofillStream).toHaveBeenCalledWith({ target: inputEl, isAutofilled: false });
  });

  it('should remove attribute and autofilled classes upon stopMonitor', () => {
    const inputEl = inputs.at(0).getDOMNode();
    let animationStartCallback = () => {};
    const autofillStream = jest.fn(({ isAutofilled }) => {
      inputEl.setAttribute('data-autofilled', isAutofilled);
    });
    inputEl.addEventListener.mockImplementation((_, cb) => animationStartCallback = cb);

    const afm = autofillMonitor.instance();
    const id = _.uniqueId();
    afm.monitor({
      id,
      element: inputEl,
      callback: autofillStream,
    });

    animationStartCallback({ animationName: AUTOFILL_ANIMATION_START, target: inputEl });
    expect(inputEl.getAttribute('data-autofilled')).toBe('true');

    afm.stopMonitoring(id);
    expect(inputEl.hasAttribute('data-autofilled')).toBe(false);
  });

  it('should not emit on init if input is unfilled', () => {
    const inputEl = inputs.at(0).getDOMNode();
    let animationStartCallback = () => {};
    const autofillStream = jest.fn(({ isAutofilled }) => {
      inputEl.setAttribute('data-autofilled', isAutofilled);
    });
    inputEl.addEventListener.mockImplementation((_, cb) => animationStartCallback = cb);

    const afm = autofillMonitor.instance();
    const id = _.uniqueId();
    afm.monitor({
      id,
      element: inputEl,
      callback: autofillStream,
    });

    animationStartCallback({ animationName: AUTOFILL_ANIMATION_END, target: inputEl });
    expect(autofillStream).not.toHaveBeenCalled();
  });
});

class Inputs extends React.Component {
  render() {
    return (
      /** Plain input... will be programmatically monitored */
      <Platform>
        <div>
          { this.props.hasAutofill ?
            <AutofillMonitor /> :
            null
          }
          <input id="1" />
          <input id="2" />
          <input id="3" />
        </div>
      </Platform>
    )
  }
}

Inputs.defaultProps = { hasAutofill: true };
