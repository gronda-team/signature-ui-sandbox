import * as React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';
import { ButtonToggle, ButtonToggleGroup } from '../exports';

describe('<ButtonToggleGroup /> ecosystem', () => {
  describe('Exclusive selection group', () => {
    let wrapper;
    let group;
    let groupEl;
    let buttons;
    let buttonInstances;
    let buttonEls;
    let onChangeSpy;

    beforeAll(() => {
      wrapper = mount(<PlainButtonToggle />);
      onChangeSpy = jest.fn(({ value }) => {
        wrapper.setState({ groupValue: value });
      });
    });

    beforeEach(() => {
      wrapper.mount();
      group = wrapper.find('ButtonToggleGroup');
      groupEl = group.getDOMNode();
      buttons = wrapper.find('ButtonToggle');
      buttonInstances = buttons.find('button');
      buttonEls = buttonInstances.map(button => button.getDOMNode());
    });

    afterEach(() => {
      wrapper.unmount();
      onChangeSpy.mockClear();
    });

    it('should set button toggle names based on the group name', () => {
      const name = group.instance().getName();
      expect(name).toBeTruthy();
      buttonEls.forEach((buttonToggle) => {
        expect(buttonToggle.name).toEqual(name);
      });
    });

    it('should disable click interactions when the group is disabled', () => {
      wrapper.setProps({ onChange: onChangeSpy });

      wrapper.setState({ isGroupDisabled: true });

      buttonInstances.at(0).simulate('click');
      expect(buttonEls[0].disabled).toBe(true);
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(buttonEls[0].getAttribute('aria-pressed')).toBe('false');

      wrapper.setState({ isGroupDisabled: false });
      expect(buttonEls[0].disabled).toBe(false);
      buttonInstances.at(0).simulate('click');
      expect(onChangeSpy.mock.calls[0][0]).toMatchObject({ value: 'test1' });
      expect(buttonEls[0].getAttribute('aria-pressed')).toBe('true');
    });

    it('should set aria-disabled based on whether the group is disabled', () => {
      expect(groupEl.getAttribute('aria-disabled')).toBe('false');
      wrapper.setState({ isGroupDisabled: true });

      expect(groupEl.getAttribute('aria-disabled')).toBe('true');
    });

    it('should disable the underlying button when the group is disabled', () => {
      expect(buttonInstances.everyWhere(button => button.getDOMNode().disabled))
        .toBe(false);

      wrapper.setState({ isGroupDisabled: true });

      expect(buttonInstances.everyWhere(button => button.getDOMNode().disabled))
        .toBe(true);
    });

    it('should update the group value when one of the toggles changes', () => {
      wrapper.setProps({ onChange: onChangeSpy });
      expect(wrapper.state('groupValue')).toBeFalsy();
      buttonInstances.at(0).simulate('click');
      expect(wrapper.state('groupValue')).toBe('test1');
    });

    it('should update the group and toggles when one of the button toggles is clicked', () => {
      wrapper.setProps({ onChange: onChangeSpy });
      expect(wrapper.state('groupValue')).toBeFalsy();

      buttonInstances.at(0).simulate('click');
      expect(wrapper.state('groupValue')).toBe('test1');
      expect(buttons.at(0).instance().isChecked()).toBe(true);

      buttonInstances.at(1).simulate('click');
      expect(wrapper.state('groupValue')).toBe('test2');
      expect(buttons.at(0).instance().isChecked()).toBe(false);
      expect(buttons.at(1).instance().isChecked()).toBe(true);
    });

    it('should change the vertical state', () => {
      wrapper.setState({ isVertical: true });
      expect(wrapper.find('div[data-vertical=true]').length).toBeGreaterThan(0);
    });

    it('should emit a change event from the button toggles', () => {
      const spy = jest.fn();
      wrapper.setState({
        listeners: [spy, _.noop, _.noop],
      });

      buttonInstances.at(0).simulate('click');
      expect(spy).toHaveBeenCalledTimes(1);

      buttonInstances.at(0).simulate('click');
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should emit a change event from the button toggle group', () => {
      wrapper.setProps({
        onChange: onChangeSpy,
      });

      buttonInstances.at(0).simulate('click');
      expect(onChangeSpy).toHaveBeenCalled();

      buttonInstances.at(1).simulate('click');
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
    });

    it('should emit a selection event using onSelectionChange', () => {
      const onSelectionChangeSpy = jest.fn();
      wrapper.setProps({
        onChange: onChangeSpy,
        onSelectionChange: onSelectionChangeSpy
      });

      buttonInstances.at(0).simulate('click');
      expect(onSelectionChangeSpy).toHaveBeenCalledWith({
        removed: [null], added: ['test1'],
      });

      buttonInstances.at(1).simulate('click');
      expect(onSelectionChangeSpy).toHaveBeenCalledWith({
        removed: ['test1'], added: ['test2'],
      });
    });

    it('should update the group and button toggles when updating the group value', () => {
      wrapper.setState({ groupValue: 'test1' });

      expect(buttons.at(0).instance().isChecked()).toBe(true);
      expect(buttons.at(1).instance().isChecked()).toBe(false);

      wrapper.setState({ groupValue: 'test2' });

      expect(buttons.at(0).instance().isChecked()).toBe(false);
      expect(buttons.at(1).instance().isChecked()).toBe(true);
    });

    it('should deselect all of the toggles when the group value is cleared', () => {
      wrapper.setState({ groupValue: 'test1' });
      expect(buttons.at(0).instance().isChecked()).toBe(true);

      wrapper.setState({ groupValue: null });
      buttons.forEach((button) => {
        expect(button.instance().isChecked()).toBe(false);
      });
    });
  });

  describe('Multiple selection group', () => {
    let wrapper;
    let group;
    let groupEl;
    let buttons;
    let buttonInstances;
    let buttonEls;
    let onChangeSpy;

    beforeAll(() => {
      onChangeSpy = jest.fn(({ value }) => {
        wrapper.setState({ groupValue: value });
      });
    });

    beforeEach(() => {
      wrapper = mount(<PlainButtonToggleMultiple />);
      group = wrapper.find('ButtonToggleGroup');
      groupEl = group.getDOMNode();
      buttons = wrapper.find('ButtonToggle');
      buttonInstances = buttons.find('button');
      buttonEls = buttonInstances.map(button => button.getDOMNode());
    });

    afterEach(() => {
      wrapper.unmount();
      onChangeSpy.mockClear();
    });

    it('should disable click interactions when the group is disabled', () => {
      wrapper.setState({ isGroupDisabled: true });

      buttonInstances.at(0).simulate('click');
      expect(buttonEls[0].getAttribute('aria-pressed')).toBe('false');
    });

    it('should check a button toggle when clicked', () => {
      wrapper.setProps({ onChange: onChangeSpy });
      buttonEls.forEach((button) => {
        expect(button.getAttribute('aria-pressed')).toBe('false');
      });

      buttonInstances.at(0).simulate('click');
      expect(wrapper.state('groupValue')).toEqual(['eggs']);
      expect(buttonEls[0].getAttribute('aria-pressed')).toBe('true');
    });

    it('should allow for multiple toggles to be selected', () => {
      wrapper.setProps({ onChange: onChangeSpy });
      buttonInstances.at(0).simulate('click');
      expect(wrapper.state('groupValue')).toEqual(['eggs']);
      expect(buttonEls[0].getAttribute('aria-pressed')).toBe('true');

      buttonInstances.at(1).simulate('click');
      expect(wrapper.state('groupValue')).toEqual(['eggs', 'flour']);
      expect(buttonEls[0].getAttribute('aria-pressed')).toBe('true');
      expect(buttonEls[1].getAttribute('aria-pressed')).toBe('true');
    });

    it('should change the vertical state', () => {
      wrapper.setState({ isVertical: true });
      expect(wrapper.find('div[data-vertical=true]').length).toBeGreaterThan(0);
    });

    it('should deselect a button toggle when selected twice', () => {
      wrapper.setProps({ onChange: onChangeSpy });
      buttonInstances.at(0).simulate('click');
      expect(wrapper.state('groupValue')).toEqual(['eggs']);
      expect(buttonEls[0].getAttribute('aria-pressed')).toBe('true');

      buttonInstances.at(0).simulate('click');
      expect(wrapper.state('groupValue')).toEqual([]);
      expect(buttonEls[0].getAttribute('aria-pressed')).toBe('false');
    });

    it('should emit a change event for state changes', () => {
      const changeSpy = jest.fn();
      wrapper.setProps({ onChange: onChangeSpy });
      wrapper.setState({ listeners: [changeSpy, _.noop, _.noop] });
      expect(buttonEls[0].getAttribute('aria-pressed')).toBe('false');
      buttonInstances.at(0).simulate('click');

      expect(changeSpy).toHaveBeenCalled();
      expect(wrapper.state('groupValue')).toEqual(['eggs']);

      buttonInstances.at(0).simulate('click');
      expect(wrapper.state('groupValue')).toEqual([]);

      expect(changeSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('As standalone', () => {
    let wrapper;
    let button;
    let buttonInstance;
    let buttonEl;
    let onChangeSpy;

    beforeAll(() => {
      onChangeSpy = jest.fn(({ value }) => {
        wrapper.setState({ value });
      });
    });

    beforeEach(() => {
      wrapper = mount(<StandaloneButtonToggle />);
      button = wrapper.find('ButtonToggle');
      buttonInstance = button.find('button');
      buttonEl = buttonInstance.getDOMNode();
    });

    afterEach(() => {
      wrapper.unmount();
      onChangeSpy.mockClear();
    });

    it('should toggle when clicked', () => {
      wrapper.setProps({ onChange: onChangeSpy });
      buttonInstance.simulate('click');

      expect(button.instance().isChecked()).toBe(true);

      buttonInstance.simulate('click');
      expect(button.instance().isChecked()).toBe(false);
    });

    it('should emit a change event for state changes', () => {
      wrapper.setProps({ onChange: onChangeSpy });
      expect(button.instance().isChecked()).toBe(false);

      buttonInstance.simulate('click');
      expect(onChangeSpy).toHaveBeenCalled();

      buttonInstance.simulate('click');
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
    });

    it('should focus on underlying button element', () => {
      expect(document.activeElement).not.toBe(buttonEl);

      button.instance().focus();

      expect(document.activeElement).toBe(buttonEl);
    });

    it('should not assign a name to the underlying button', () => {
      expect(buttonEl.name).toBeFalsy();
    });

    it('should have correct aria-pressed attribute', () => {
      wrapper.setProps({ onChange: onChangeSpy });
      expect(buttonEl.getAttribute('aria-pressed')).toBe('false');

      buttonInstance.simulate('click');

      expect(buttonEl.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('aria-label handling', () => {
    it('should not set the aria-label attribute if none is already provided', () => {
      const wrapper = mount(<StandaloneButtonToggle />);
      const buttonEl = wrapper.find('button').getDOMNode();

      expect(buttonEl.hasAttribute('aria-label')).toBe(false);
    });

    it('should use the provided aria-label', () => {
      const wrapper = mount(<ButtonToggleWithAriaLabel />);
      const buttonEl = wrapper.find('button').getDOMNode();

      expect(buttonEl.getAttribute('aria-label')).toBe('Super effective');
    });
  });

  describe('aria-labelledby handling', () => {
    it('should not set the aria-labelledby attribute if none is already provided', () => {
      const wrapper = mount(<StandaloneButtonToggle />);
      const buttonEl = wrapper.find('button').getDOMNode();

      expect(buttonEl.getAttribute('aria-labelledby')).toBe(null);
    });

    it('should use the provided aria-labelledby', () => {
      const wrapper = mount(<ButtonToggleWithAriaLabelledBy />);
      const buttonEl = wrapper.find('button').getDOMNode();

      expect(buttonEl.getAttribute('aria-labelledby')).toBe('some-id');
    });
  });

  describe('with tabIndex', () => {
    let wrapper;
    let buttonEl;

    beforeAll(() => {
      wrapper = mount(<ButtonToggleWithTabIndex />);
      buttonEl = wrapper.find('button').getDOMNode();
    });

    beforeEach(() => {
      wrapper.mount();
    });

    beforeAll(() => {
      wrapper.unmount();
    });

    it('should forward the tabIndex to the underlying button', () => {
      expect(buttonEl.tabIndex).toBe(3);
    });

    it('should clear the tabIndex from the root element', () => {
      expect(wrapper.childAt(0).getDOMNode().tabIndex).toBe(-1);
    });

    it('should forward focus to the underlying button when the host is focused', () => {
      const root = wrapper.childAt(0);

      expect(document.activeElement).not.toBe(buttonEl);

      root.simulate('focus');

      expect(document.activeElement).toEqual(buttonEl);
    });
  });
});

class PlainButtonToggle extends React.Component {
  constructor() {
    super();

    this.state = {
      isGroupDisabled: false,
      isVertical: false,
      groupValue: undefined,
      listeners: [_.noop, _.noop, _.noop],
    };
  }

  render() {
    return (
      <ButtonToggleGroup
        onChange={this.props.onChange}
        onSelectionChange={this.props.onSelectionChange}
        disabled={this.state.isGroupDisabled}
        vertical={this.state.isVertical}
        value={this.state.groupValue}
      >
        <ButtonToggle onChange={this.state.listeners[0]} value="test1">Test1</ButtonToggle>
        <ButtonToggle onChange={this.state.listeners[1]} value="test2">Test2</ButtonToggle>
        <ButtonToggle onChange={this.state.listeners[2]} value="test3">Test3</ButtonToggle>
      </ButtonToggleGroup>
    );
  }
}

PlainButtonToggle.defaultProps = {
  onChange: () => {},
  onSelectionChange: () => {},
};

class PlainButtonToggleMultiple extends React.Component {
  constructor() {
    super();
    this.state = {
      isGroupDisabled: false,
      isVertical: false,
      groupValue: [],
      listeners: [_.noop, _.noop, _.noop],
    };
  }
  render() {
    return (
      <ButtonToggleGroup
        multiple
        onChange={this.props.onChange}
        disabled={this.state.isGroupDisabled}
        vertical={this.state.isVertical}
        value={this.state.groupValue}
      >
        <ButtonToggle onChange={this.state.listeners[0]} value="eggs">eggs</ButtonToggle>
        <ButtonToggle onChange={this.state.listeners[1]} value="flour">flour</ButtonToggle>
        <ButtonToggle onChange={this.state.listeners[2]} value="sugar">sugar</ButtonToggle>
      </ButtonToggleGroup>
    )
  }
}

class StandaloneButtonToggle extends React.Component {
  constructor() {
    super();
    this.state = { value: null };
  }

  render() {
    return <ButtonToggle {...this.props} checked={this.state.value === 1} value={1}>Yes</ButtonToggle>;
  }
}

function ButtonToggleWithAriaLabel(props) {
  return <ButtonToggle {...props} aria-label="Super effective">Do</ButtonToggle>;
}

function ButtonToggleWithAriaLabelledBy(props) {
  return <ButtonToggle {...props} aria-labelledby="some-id">Nice</ButtonToggle>;
}

function ButtonToggleWithTabIndex(props) {
  return <ButtonToggle {...props} id={'fixed-for-rendering'} tabIndex={3}>Tabbable</ButtonToggle>;
}
