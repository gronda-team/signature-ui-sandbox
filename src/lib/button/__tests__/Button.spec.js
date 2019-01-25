import * as React from 'react';
import _ from 'lodash';
import { mount } from 'enzyme';
import { Button } from '../exports';

describe('<Button />', () => {
  let app;
  let button;
  let a;
  let buttonEl;
  let aEl;

  beforeEach(() => {
    app = mount(<TestApp />);

    button = app.find('button').at(0);
    a = app.find('a');
    buttonEl = button.instance();
    aEl = a.instance();
  });

  // General button tests
  it('should have data-attributes corresponding to color', () => {
    app.setState({ color: 'primary' });

    expect(buttonEl.getAttribute('data-color')).toEqual('primary');
    expect(aEl.getAttribute('data-color')).toEqual('primary');

    app.setState({ color: 'secondary' });

    expect(buttonEl.getAttribute('data-color')).toEqual('secondary');
    expect(aEl.getAttribute('data-color')).toEqual('secondary');
  });

  describe('as <button />', () => {
    it('should handle a click on the button', () => {
      button.simulate('click');

      expect(app.state('clickCount')).toBe(1);
    });

    it('should not increment if it is disabled', () => {
      app.setState({ isDisabled: true });

      button.simulate('click');

      expect(app.state('clickCount')).toBe(0);
    });

    it('should disable the native button element', () => {
      expect(buttonEl.disabled).toBe(false);

      app.setState({ isDisabled: true });

      expect(buttonEl.disabled).toBe(true);
    });
  });

  describe('as <a />', () => {
    it('should not redirect if it is disabled', () => {
      app.setState({ isDisabled: true });
      const mock = {
        stopImmediatePropagation: jest.fn(),
        preventDefault: jest.fn(),
      };
      a.simulate('click', mock);
      expect(mock.preventDefault).toHaveBeenCalled();
      expect(mock.stopImmediatePropagation).toHaveBeenCalled();
    });

    it('should remove tabIndex if it is disabled', () => {
      expect(aEl.getAttribute('tabIndex')).toBe('0');
      app.setState({ isDisabled: true });
      expect(aEl.getAttribute('tabIndex')).toBe('-1');
    });

    it('should add aria-disabled if disabled', () => {
      expect(aEl.getAttribute('aria-disabled')).toBe('false');
      app.setState({ isDisabled: true });
      expect(aEl.getAttribute('aria-disabled')).toBe('true');
    });

    it('should be able to set a custom tabIndex', () => {
      app.setState({ tabIndex: 3 });
      expect(aEl.getAttribute('tabIndex')).toBe('3');
      app.setState({ isDisabled: true });
      expect(aEl.getAttribute('tabIndex')).toBe('-1');
    });
  });
});

/** Test component that contains all kinds of buttons */
class TestApp extends React.Component {
  constructor() {
    super();

    this.state = {
      tabIndex: null,
      clickCount: 0,
      isDisabled: false,
      color: null,
    };
  }

  increment = () => {
    this.setState(state => ({
      clickCount: state.clickCount + 1,
    }));
  };

  render() {
    return (
      <div>
        <Button
          tabIndex={this.state.tabIndex}
          disabled={this.state.isDisabled}
          color={this.state.color}
          onClick={this.increment}
        >Go</Button>
        <Button
          tabIndex={this.state.tabIndex}
          disabled={this.state.isDisabled}
          color={this.state.color}
          is="a"
          href="http://google.com"
        >Link</Button>
        <Button size="icon">Icon button</Button>
      </div>
    )
  }
}
