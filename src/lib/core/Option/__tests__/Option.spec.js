import * as React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, createEvent, fireEvent, cleanup, act } from '@testing-library/react';
import Option from '../Option';
import { OptionParentContext, PARENT_INIT_CONTEXT, useOptionFilter, useRefManager } from '../context';
import { ENTER, SPACE } from '../../../../cdk/Keycodes';
import OptGroup from '../OptGroup';
import { TestProviderWrapper } from '../..';

function renderWithWrapper(app) {
  return render(app, { wrapper: TestProviderWrapper });
}

describe('Option', function () {
  describe('basic behavior', function () {
    let rendered;

    afterEach(function () {
      cleanup();
    });

    it('should have role `option`', function () {
      rendered = renderWithWrapper(<Option data-list-key="option">I'm an option!</Option>);
      const option = rendered.container.querySelector('[data-sui="option"]');
      expect(option).toHaveAttribute('role', 'option');
    });

    it('should have a default id', function () {
      rendered = renderWithWrapper(<Option data-list-key="option">I'm an option!</Option>);
      const option = rendered.container.querySelector('[data-sui="option"]');
      expect(option.id).toBeTruthy();
    });

    it('should be able to set a custom id', function () {
      rendered = renderWithWrapper(
        <Option data-list-key="option" id="test-id">
          I'm an option!
        </Option>
      );

      const option = rendered.container.querySelector('[data-sui="option"]');
      expect(option.id).toBe('test-id');
    });

    it('should be able to set custom attributes', function () {
      rendered = renderWithWrapper(<Option data-list-key="option" data-testid="test">Test!</Option>);

      expect(rendered.getByTestId('test')).toBeTruthy();
    });

    it('should be able to bind custom `onClick` listeners', function () {
      const onClick = jest.fn();
      rendered = renderWithWrapper(
        <Option data-testid="test" data-list-key="option" onClick={onClick}>Test!</Option>
      );

      fireEvent.click(rendered.queryByTestId('test'));

      expect(onClick).toHaveBeenCalled();
    });

    it('should be able to bind custom `onKeyDown` listeners', function () {
      const onKeyDown = jest.fn();
      rendered = renderWithWrapper(
        <Option data-testid="test" data-list-key="option" onKeyDown={onKeyDown}>Test!</Option>
      );

      fireEvent.keyDown(rendered.queryByTestId('test'));

      expect(onKeyDown).toHaveBeenCalled();
    });
  });

  describe('with OptionParent context', function () {
    const setProvider = (payload) => {
      act(() => {
        window.__setProvider__(state => ({ ...state, ...payload }));
      });
    };

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    describe('standalone with `onSelectionChange`', function () {
      let rendered;
      let option;
      let selectionSpy = jest.fn();

      beforeEach(function () {
        rendered = renderWithWrapper(
          <OptionsWithParent>
            <Option data-list-key="hello">Hello</Option>
          </OptionsWithParent>
        );

        setProvider({ onSelectionChange: selectionSpy });

        option = rendered.container.querySelector('[data-sui="option"]');
      });

      it('should call `onSelectionChange` when pressing enter', function () {
        const event = createEvent.keyDown(option, { keyCode: ENTER });
        const eventSpy = jest.spyOn(event, 'preventDefault');

        fireEvent(option, event);

        expect(eventSpy).toHaveBeenCalled();
        expect(selectionSpy).toHaveBeenCalled();
      });

      it('should call `onSelectionChange` when pressing space', function () {
        const event = createEvent.keyDown(option, { keyCode: SPACE });
        const eventSpy = jest.spyOn(event, 'preventDefault');

        fireEvent(option, event);

        expect(eventSpy).toHaveBeenCalled();
        expect(selectionSpy).toHaveBeenCalled();
      });

      it('should not do anything when pressing the selection keys with a modifier', function () {
        const spaceEvent = createEvent.keyDown(option, { keyCode: SPACE, shiftKey: true });
        const enterEvent = createEvent.keyDown(option, { keyCode: SPACE, shiftKey: true });

        const spaceEventSpy = jest.spyOn(spaceEvent, 'preventDefault');
        const enterEventSpy = jest.spyOn(enterEvent, 'preventDefault');

        fireEvent(option, spaceEvent);
        expect(spaceEventSpy).not.toHaveBeenCalled();

        fireEvent(option, enterEvent);
        expect(enterEventSpy).not.toHaveBeenCalled();

        expect(selectionSpy).not.toHaveBeenCalled();
      });

      it('should call `onSelectionChange` when clicking', function () {
        fireEvent.click(option);

        expect(selectionSpy).toHaveBeenCalled();
      });
    });

    describe('multiple options', function () {
      let rendered;
      beforeEach(function () {
        rendered = renderWithWrapper(
          <OptionsWithParent>
            <Option data-list-key="first" value="first">First</Option>
            <Option data-list-key="second" value="second">Second</Option>
            <Option data-list-key="third" value="third" disabled>Third</Option>
          </OptionsWithParent>
        );
      });

      afterEach(function () {
        setProvider(PARENT_INIT_CONTEXT);
        cleanup();
        jest.clearAllMocks();
      });

      it('should get whether an option is disabled', function () {
        const options = rendered.container.querySelectorAll('[data-sui="option"]');

        const disabledStates = Array.from(options)
          .map(option => option.getAttribute('data-disabled'));
        expect(disabledStates).toEqual(['false', 'false', 'true']);

        const ariaDisabledStates = Array.from(options)
          .map(option => option.getAttribute('data-disabled'));
        expect(ariaDisabledStates).toEqual(['false', 'false', 'true']);
      });

      it('should not call `onSelectionChange` when clicking a disabled option', function () {
        const onSelectionChangeSpy = jest.fn();
        setProvider({ onSelectionChange: onSelectionChangeSpy });

        const disabledOption = rendered.container.querySelector('[data-disabled="true"]');

        fireEvent.click(disabledOption);
        expect(onSelectionChangeSpy).not.toHaveBeenCalled();
      });

      it('should not call `onSelectionChange` when keyboard selecting a disabled option', function () {
        const onSelectionChangeSpy = jest.fn();
        setProvider({ onSelectionChange: onSelectionChangeSpy });

        const disabledOption = rendered.container.querySelector('[data-disabled="true"]');

        fireEvent.keyDown(disabledOption, { keyCode: SPACE });
        expect(onSelectionChangeSpy).not.toHaveBeenCalled();

        fireEvent.keyDown(disabledOption, { keyCode: ENTER });
        expect(onSelectionChangeSpy).not.toHaveBeenCalled();
      });

      it('should get whether an option is selected', function () {
        let hasSelected = rendered.container.querySelector('[data-selected="true"]');
        expect(hasSelected).toBeFalsy();

        // Simulate clicking and selecting the first option
        setProvider({ selected: ['first'] });

        hasSelected = rendered.container.querySelector('[data-selected="true"]');
        expect(hasSelected).toBeTruthy();
        expect(hasSelected).toHaveTextContent('First');

        // Simulate clicking and selecting the second option
        setProvider({ selected: ['second'] });

        hasSelected = rendered.container.querySelector('[data-selected="true"]');
        expect(hasSelected).toBeTruthy();
        expect(hasSelected).toHaveTextContent('Second');
      });

      it('should get whether an option is in multi-select mode', function () {
        let multipleOptions = rendered.container.querySelectorAll('[data-multiple="true"]');
        expect(multipleOptions).toHaveLength(0);

        setProvider({ multiple: true });

        multipleOptions = rendered.container.querySelectorAll('[data-multiple="true"]');
        expect(multipleOptions).toHaveLength(3);
      });

      it('should not trigger any active styles ' +
        'when `usesActiveDescendantManager` is false', function () {
        let active = rendered.container.querySelector('[data-active="true"]');
        expect(active).toBeFalsy();

        setProvider({ activeListKey: 'first' });
        active = rendered.container.querySelector('[data-active="true"]');
        expect(active).toBeFalsy();
      });

      it('should give active styles for an option when it is the activeListKey in the parent', function () {
        let active = rendered.container.querySelector('[data-active="true"]');
        expect(active).toBeFalsy();

        setProvider({ usesActiveDescendantManager: true, activeListKey: 'second' });

        active = rendered.container.querySelector('[data-active="true"]');
        expect(active).toBeTruthy();
        expect(active).toHaveTextContent('Second');

        setProvider({ activeListKey: null });
        active = rendered.container.querySelector('[data-active="true"]');
        expect(active).toBeFalsy();
      });

      it('should not call `element.focus` when `usesFocusManager` is false', function () {
        const options = rendered.container.querySelectorAll('[data-sui="option"]');

        const secondOption = options[1];
        const focusSpy = jest.spyOn(secondOption, 'focus');

        setProvider({ usesFocusManager: false, activeListKey: 'second' });

        expect(focusSpy).not.toHaveBeenCalled();
      });

      it("'should call `element.focus` when the option's list key matches the one in the parent", function () {
        setProvider({ usesFocusManager: true });
        const options = rendered.container.querySelectorAll('[data-sui="option"]');
        const firstOption = options[0];
        const secondOption = options[1];
        const firstFocusSpy = jest.spyOn(firstOption, 'focus');
        const secondFocusSpy = jest.spyOn(secondOption, 'focus');

        setProvider({ activeListKey: 'first' });
        expect(firstFocusSpy).toHaveBeenCalledTimes(1);
        expect(secondFocusSpy).not.toHaveBeenCalled();

        setProvider({ activeListKey: 'second' });
        expect(firstFocusSpy).toHaveBeenCalledTimes(1);
        expect(secondFocusSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('managing refs', function () {
      let refs = [];
      let register;

      beforeEach(function () {
        register = jest.fn((payload) => {
          refs.push(payload);

          // Simulate behavior where a parent's array of refs is manipulated like this
          return () => {
            const index = refs.indexOf(payload);
            refs.splice(index, 1);
          };
        });
      });

      afterEach(function () {
        refs = [];
        cleanup();
        jest.clearAllMocks();
      });

      it('should call the register function when an option is given', function () {
        const rendered = renderWithWrapper(
          <OptionsWithParent register={register}>
            <Option data-list-key="hello">Hello</Option>
          </OptionsWithParent>
        );

        expect(register).toHaveBeenCalledTimes(1);
        expect(refs).toHaveLength(1);

        rendered.unmount();
        expect(refs).toHaveLength(0);
      });

      it('should call the register for each child', function () {
        const rendered = renderWithWrapper(
          <OptionsWithParent register={register}>
            <Option data-list-key="apple">Apple</Option>
            <Option data-list-key="banana">Banana</Option>
          </OptionsWithParent>
        );

        expect(register).toHaveBeenCalledTimes(2);

        rendered.rerender(
          <OptionsWithParent register={register}>
            <Option data-list-key="apple">Apple</Option>
            <Option data-list-key="banana">Banana</Option>
            <Option data-list-key="papaya">Papaya</Option>
          </OptionsWithParent>
        );

        expect(register).toHaveBeenCalledTimes(3);
      });

      it('should call the register function with the appropriate arguments', function () {
        renderWithWrapper(
          <OptionsWithParent register={register}>
            <Option data-list-key="hello">Hello</Option>
          </OptionsWithParent>
        );

        expect(register).toHaveBeenCalledWith(expect.objectContaining({
          id: expect.any(String),
          'data-list-key': expect.any(String),
          getLabel: expect.any(Function),
          select: expect.any(Function),
        }));
      });

      it('should pass the properties on the ref itself', function () {
        renderWithWrapper(
          <OptionsWithParent register={register}>
            <Option id="test-id" data-list-key="hello">Hello</Option>
          </OptionsWithParent>
        );

        const ref = refs[0];
        expect(ref.id).toBe('test-id');
        expect(ref['data-list-key']).toBe('hello');
        expect(ref.getLabel()).toBe('Hello');
      });

      it("should update the ref in place when the option's properties change", function () {
        const rendered = renderWithWrapper(
          <OptionsWithParent register={register}>
            <Option id="apple" data-list-key="hello">Hello</Option>
          </OptionsWithParent>
        );

        expect(register).toHaveBeenCalledTimes(1);
        expect(refs).toHaveLength(1);

        rendered.rerender(
          <OptionsWithParent register={register}>
            <Option id="banana" data-list-key="hello">Hello</Option>
          </OptionsWithParent>
        );

        expect(register).toHaveBeenCalledTimes(2);
        expect(refs).toHaveLength(1);

        const ref = refs[0];
        expect(ref.id).toBe('banana');
      });

      it('should expose `getLabel` to use the `label` prop', function () {
        const rendered = renderWithWrapper(
          <OptionsWithParent register={register}>
            <Option label="Apple" data-list-key="hello">Banana</Option>
          </OptionsWithParent>
        );

        let ref = refs[0];
        expect(ref.getLabel()).toBe('Apple');

        rendered.rerender(
          <OptionsWithParent register={register}>
            <Option data-list-key="hello">Banana</Option>
          </OptionsWithParent>
        );

        ref = refs[0];
        expect(ref.getLabel()).toBe('Banana');
      });

      it('should have `getLabel` return an empty string ' +
        'if no text content or label prop is provided', function () {
        renderWithWrapper(
          <OptionsWithParent register={register}>
            <Option data-list-key="hello" />
          </OptionsWithParent>
        );

        const ref = refs[0];
        expect(ref.getLabel()).toBe('');
      });
    });
  });
});

function OptionsWithParent({ register = PARENT_INIT_CONTEXT.register, children }) {
  const [provider, setProvider] = React.useState(PARENT_INIT_CONTEXT);

  React.useEffect(() => {
    window.__setProvider__ = setProvider;

    return () => {
      delete window.__setProvider__;
    };
  }, [setProvider]);

  const finalProvider = React.useMemo(() => ({
    ...provider,
    register,
  }), [provider, register]);

  return (
    <OptionParentContext.Provider value={finalProvider}>
      { children }
    </OptionParentContext.Provider>
  );
}

describe('OptGroup', function () {
  it(`should give a default id if one isn't provided`, function () {
    const rendered = renderWithWrapper(
      <OptGroup data-list-key="group-1">
        <Option data-list-key="option-1">Option</Option>
      </OptGroup>
    );

    const group = rendered.container.querySelector('[data-sui="optgroup"]');

    expect(group.id).toBeTruthy();
  });

  it('should be able to set a custom id', function () {
    const rendered = renderWithWrapper(
      <OptGroup data-list-key="group-1" id="test-id">
        <Option data-list-key="option-1">Option</Option>
      </OptGroup>
    );

    const group = rendered.container.querySelector('[data-sui="optgroup"]');

    expect(group.id).toBe('test-id');
  });

  it('should be able to disable the options', function () {
    const rendered = renderWithWrapper(
      <OptGroup data-list-key="group-1">
        <Option data-list-key="option-1">Option</Option>
      </OptGroup>
    );

    let disabledOption = rendered.container.querySelector('[data-disabled="true"]');
    expect(disabledOption).toBeFalsy();

    rendered.rerender(
      <OptGroup data-list-key="group-1" disabled>
        <Option data-list-key="option-1">Option</Option>
      </OptGroup>
    );
    disabledOption = rendered.container.querySelector('[data-disabled="true"]');
    expect(disabledOption).toBeTruthy();
  });

  it('should be able to set a label as a JSX child', function () {
    const rendered = renderWithWrapper(
      <OptGroup data-list-key="group-1" label={<div data-testid="label">Label!</div>}>
        <Option data-list-key="option-1">Option</Option>
      </OptGroup>
    );

    const label = rendered.queryByTestId('label');
    expect(label).toBeTruthy();
    expect(label).toHaveTextContent('Label!');
  });
});

describe('useRefManager', function () {
  const getRefs = () => window.__refs__;

  afterEach(function () {
    cleanup();
    jest.clearAllMocks();
  });

  it('should return an empty array by default', function () {
    renderWithWrapper(<OptionParentManager />);

    expect(getRefs()).toHaveLength(0);
  });

  it('should add refs for each child', async function () {
    const rendered = renderWithWrapper(
      <OptionParentManager>
        <Option data-list-key="apple">Apple</Option>
      </OptionParentManager>
    );

    expect(getRefs().length).toBe(1);

    rendered.rerender(
      <OptionParentManager>
        <Option data-list-key="apple">Apple</Option>
        <Option data-list-key="banana">Banana</Option>
      </OptionParentManager>
    );

    expect(getRefs().length).toBe(2);
    const keys = getRefs().map(item => item['data-list-key']);
    expect(keys).toEqual(['apple', 'banana']);
  });

  it('should be able to remove refs when children are unmounted', function () {
    const rendered = renderWithWrapper(
      <OptionParentManager>
        <Option data-list-key="apple">Apple</Option>
        <Option data-list-key="banana">Banana</Option>
      </OptionParentManager>
    );

    let currentRefs = getRefs();
    expect(currentRefs.length).toBe(2);
    let listKeys = currentRefs.map(ref => ref['data-list-key']);
    expect(listKeys).toContain('apple');
    expect(listKeys).toContain('banana');

    rendered.rerender(
      <OptionParentManager>
        <Option data-list-key="apple">Apple</Option>
      </OptionParentManager>
    );

    currentRefs = getRefs();
    listKeys = currentRefs.map(ref => ref['data-list-key']);
    expect(currentRefs.length).toBe(1);
    expect(listKeys).toContain('apple');
    expect(listKeys).not.toContain('banana');
  });

  it("should call the parent’s `onSelectionChange` function " +
    "when the `select` function from the ref is called", function () {
    const selection = jest.fn();
    renderWithWrapper(
      <OptionParentManager onSelectionChange={selection}>
        <Option data-list-key="apple">Apple</Option>
        <Option data-list-key="banana">Banana</Option>
      </OptionParentManager>
    );

    const refs = getRefs();
    act(() => {
      refs[0].select();
    });

    expect(selection).toHaveBeenCalledTimes(1);
    expect(selection).toHaveBeenLastCalledWith(expect.objectContaining({
      'data-list-key': 'apple',
    }));

    act(() => {
      refs[1].select();
    });

    expect(selection).toHaveBeenCalledTimes(2);
    expect(selection).toHaveBeenLastCalledWith(expect.objectContaining({
      'data-list-key': 'banana',
    }));
  });

  it('should maintain the order in which children are added', function () {
    const rendered = renderWithWrapper(
      <OptionParentManager>
        <Option data-list-key="apple">Apple</Option>
        <Option data-list-key="banana">Banana</Option>
      </OptionParentManager>
    );

    let currentRefs = getRefs();
    expect(currentRefs.length).toBe(2);

    rendered.rerender(
      <OptionParentManager>
        <Option data-list-key="apple">Apple</Option>
        <Option data-list-key="cherry">Cherry</Option>
        <Option data-list-key="banana">Banana</Option>
      </OptionParentManager>
    );

    currentRefs = getRefs();
    expect(currentRefs.length).toBe(3);
    expect(currentRefs[0]['data-list-key']).toBe('apple');
    expect(currentRefs[1]['data-list-key']).toBe('cherry');
    expect(currentRefs[2]['data-list-key']).toBe('banana');
  });

  it('should maintain the number of items if two items are swapped', function () {
    const rendered = renderWithWrapper(
      <OptionParentManager>
        <Option data-list-key="apple">Apple</Option>
        <Option data-list-key="banana">Banana</Option>
      </OptionParentManager>
    );

    let currentRefs = getRefs();
    expect(currentRefs.length).toBe(2);
    expect(currentRefs[0]['data-list-key']).toBe('apple');
    expect(currentRefs[1]['data-list-key']).toBe('banana');

    rendered.rerender(
      <OptionParentManager>
        <Option data-list-key="banana">Banana</Option>
        <Option data-list-key="apple">Apple</Option>
      </OptionParentManager>
    );

    currentRefs = getRefs();
    expect(currentRefs.length).toBe(2);
    expect(currentRefs[0]['data-list-key']).toBe('banana');
    expect(currentRefs[1]['data-list-key']).toBe('apple');
  });

  it('should maintain the order if a child prop has changed', function () {
    const rendered = renderWithWrapper(
      <OptionParentManager>
        <Option data-list-key="apple">Apple</Option>
        <Option data-list-key="banana">Banana</Option>
      </OptionParentManager>
    );

    let currentRefs = getRefs();
    expect(currentRefs[0]['data-list-key']).toBe('apple');
    expect(currentRefs[1]['data-list-key']).toBe('banana');

    // Add prop `label` to the first one
    rendered.rerender(
      <OptionParentManager>
        <Option label="fruity!" data-list-key="apple">Apple</Option>
        <Option data-list-key="banana">Banana</Option>
      </OptionParentManager>
    );

    currentRefs = getRefs();
    expect(currentRefs[0]['data-list-key']).toBe('apple');
    expect(currentRefs[0].getLabel()).toBe('fruity!');
    expect(currentRefs[1]['data-list-key']).toBe('banana');
  });

  it('should be able to take a custom sort function', function () {
    // Obviously a contrived example
    const sortFn = (child, ref) => (
      child.props.label === ref['data-list-key']
    );

    renderWithWrapper(
      <OptionParentManager sortFn={sortFn}>
        <Option id="1" label="cherry" data-list-key="apple">Apple</Option>
        <Option id="2" label="apple" data-list-key="banana">Banana</Option>
        <Option id="3" label="banana" data-list-key="cherry">Cherry</Option>
      </OptionParentManager>
    );

    expect(getRefs().map(ref => ref.id)).toEqual(['3', '1', '2']);
  });
});

function OptionParentManager(props) {
  const { onSelectionChange, register, sortFn, children } = props;
  const [provider, setProvider] = React.useState(PARENT_INIT_CONTEXT);

  React.useEffect(() => {
    window.__setProvider__ = setProvider;

    return () => {
      delete window.__setProvider__;
    };
  }, [setProvider]);

  const [refs, refRegister] = useRefManager(children, sortFn);

  React.useEffect(() => {
    window.__refs__ = refs;

    return () => {
      delete window.__refs__;
    };
  }, [refs]);

  const finalRegister = React.useCallback((payload) => {
    if (register) {
      register(payload);
    }

    return refRegister(payload);
  }, [refRegister, register]);

  const finalProvider = React.useMemo(() => ({
    ...provider,
    onSelectionChange,
    register: finalRegister,
  }), [provider, register]);

  return (
    <OptionParentContext.Provider value={finalProvider}>
      { children }
    </OptionParentContext.Provider>
  );
}

OptionParentManager.defaultProps = {
  register: PARENT_INIT_CONTEXT.register,
  onSelectionChange: PARENT_INIT_CONTEXT.onSelectionChange,
};

describe('useRefManager with OptGroup', function () {
  const getOptions = () => window.__refs__.options;
  const getGroups = () => window.__refs__.groups;

  it('should be able to handle OptGroups', function () {
    renderWithWrapper(
      <OptionGroupParentManager>
        <OptGroup data-list-key="fruits" label="Fruits" id="fruits">
          <Option data-list-key="apple">Apple</Option>
          <Option data-list-key="banana">Banana</Option>
          <Option data-list-key="pear">Pear</Option>
        </OptGroup>
        <OptGroup data-list-key="vegetables" label="Vegetables" id="vegetables">
          <Option data-list-key="potato">Potato</Option>
          <Option data-list-key="broccoli">Broccoli</Option>
          <Option data-list-key="cabbage">Cabbage</Option>
        </OptGroup>
      </OptionGroupParentManager>
    );

    const options = getOptions();
    const groups = getGroups();
    expect(options.map(option => option['data-list-key'])).toEqual([
      'apple', 'banana', 'pear', 'potato', 'broccoli', 'cabbage'
    ]);

    expect(groups.map(group => group.id)).toEqual([
      'fruits', 'vegetables'
    ]);
  });

  it('should have the option ref get the group id', function () {
    renderWithWrapper(
      <OptionGroupParentManager>
        <OptGroup data-list-key="fruits" label="Fruits" id="fruits">
          <Option data-list-key="apple">Apple</Option>
          <Option data-list-key="banana">Banana</Option>
          <Option data-list-key="pear">Pear</Option>
        </OptGroup>
      </OptionGroupParentManager>
    );

    const options = getOptions();
    options.forEach((option) => {
      expect(option.group).toBe('fruits');
    });
  });

  it('should return the current group id when it changes', function () {
    const rendered = renderWithWrapper(
      <OptionGroupParentManager>
        <OptGroup data-list-key="fruits" label="Fruits" id="fruits">
          <Option data-list-key="apple">Apple</Option>
          <Option data-list-key="banana">Banana</Option>
          <Option data-list-key="pear">Pear</Option>
        </OptGroup>
      </OptionGroupParentManager>
    );

    let options = getOptions();
    options.forEach((option) => {
      expect(option.group).toBe('fruits');
    });

    rendered.rerender(
      <OptionGroupParentManager>
        <OptGroup data-list-key="fruits" label="Fruits" id="health-products">
          <Option data-list-key="apple">Apple</Option>
          <Option data-list-key="banana">Banana</Option>
          <Option data-list-key="pear">Pear</Option>
        </OptGroup>
      </OptionGroupParentManager>
    );

    options = getOptions();
    options.forEach((option) => {
      expect(option.group).toBe('health-products');
    });
  });
});

function OptionGroupParentManager(props) {
  const { onSelectionChange, children } = props;
  const [provider, setProvider] = React.useState(PARENT_INIT_CONTEXT);

  const [options, optionGroups] = useOptionFilter(children);

  const [optionRefs, optionRegister] = useRefManager(options);
  const [optionGroupRefs, groupRegister] = useRefManager(optionGroups);

  React.useEffect(() => {
    window.__refs__ = { options: optionRefs, groups: optionGroupRefs };

    return () => {
      delete window.__refs__;
    };
  }, [optionRefs, optionGroupRefs]);

  const finalRegister = React.useCallback((payload) => {
    if (payload.group) {
      return optionRegister(payload);
    }

    return groupRegister(payload);
  }, [optionRegister, groupRegister]);

  const finalProvider = React.useMemo(() => ({
    ...provider,
    onSelectionChange,
    register: finalRegister,
  }), [provider]);

  return (
    <OptionParentContext.Provider value={finalProvider}>
      { children }
    </OptionParentContext.Provider>
  );
}
