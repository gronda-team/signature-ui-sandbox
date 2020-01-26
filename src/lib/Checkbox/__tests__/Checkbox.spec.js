import * as React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { cleanup, render, fireEvent, wait } from '@testing-library/react';
import { Checkbox } from '../exports';

const STATUS_TEST_ID = 'checked-status';
const CHECKBOX_TEST_ID = 'checkbox';
const TIMESTAMP_TEST_ID = 'timestamp';

describe('Checkbox', function () {
  describe('basic behaviors', function () {
    let rendered;
    let statusElement;
    let checkboxElement;
    /** @type {HTMLLabelElement} */
    let labelElement;
    /** @type {HTMLInputElement} */
    let inputElement;

    beforeEach(function () {
      rendered = render(<ExampleComponent />);
      statusElement = rendered.queryByTestId(STATUS_TEST_ID);
      checkboxElement = rendered.queryByTestId(CHECKBOX_TEST_ID);
      labelElement = checkboxElement.querySelector('label');
      inputElement = checkboxElement.querySelector('input[type="checkbox"]');
    });

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should add and remove the checked state', function () {
      expect(checkboxElement).toHaveAttribute('data-checked', 'false');
      expect(statusElement).toHaveTextContent('Unchecked');
      expect(inputElement.checked).toBe(false);

      fireEvent.click(inputElement);

      expect(checkboxElement).toHaveAttribute('data-checked', 'true');
      expect(statusElement).toHaveTextContent('Checked');
      expect(inputElement.checked).toBe(true);

      fireEvent.click(inputElement);

      expect(checkboxElement).toHaveAttribute('data-checked', 'false');
      expect(statusElement).toHaveTextContent('Unchecked');
      expect(inputElement.checked).toBe(false);
    });

    it('should add and remove indeterminate state', function () {
      expect(checkboxElement).toHaveAttribute('data-indeterminate', 'false');
      expect(checkboxElement).toHaveAttribute('data-checked', 'false');
      expect(inputElement.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(false);
      expect(inputElement).toHaveAttribute('aria-checked', 'false');

      rendered.rerender(<ExampleComponent indeterminate={true} />);

      expect(checkboxElement).toHaveAttribute('data-indeterminate', 'true');
      expect(checkboxElement).toHaveAttribute('data-checked', 'false');
      expect(inputElement.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(true);
      expect(inputElement).toHaveAttribute('aria-checked', 'mixed');

      rendered.rerender(<ExampleComponent indeterminate={false} />);

      expect(checkboxElement).toHaveAttribute('data-indeterminate', 'false');
      expect(checkboxElement).toHaveAttribute('data-checked', 'false');
      expect(inputElement.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(false);
      expect(inputElement).toHaveAttribute('aria-checked', 'false');
    });

    it('should not set indeterminate to false when checked is set programmatically', function () {
      rendered.rerender(<ExampleComponent indeterminate={true} />);

      expect(inputElement.indeterminate).toBe(true);

      fireEvent.click(inputElement);

      expect(inputElement.indeterminate).toBe(true);
      expect(inputElement.checked).toBe(true);
      expect(statusElement).toHaveTextContent('Checked');

      fireEvent.click(inputElement);

      expect(inputElement.indeterminate).toBe(true);
      expect(inputElement.checked).toBe(false);
      expect(statusElement).toHaveTextContent('Unchecked');
    });

    it('should toggle checked state on click', function () {
      expect(inputElement.checked).toBe(false);

      fireEvent.click(labelElement);

      expect(inputElement.checked).toBe(true);

      fireEvent.click(labelElement);

      expect(inputElement.checked).toBe(false);
    });

    it('should trigger callback when changing from indeterminate to checked', function () {
      const spy = jest.fn();
      rendered.rerender(<ExampleComponent onIndeterminateChange={spy} indeterminate={true} />);

      expect(inputElement.checked).toBe(false);
      expect(statusElement).toHaveTextContent('Unchecked');
      expect(inputElement.indeterminate).toBe(true);

      fireEvent.click(inputElement);

      expect(inputElement.checked).toBe(true);
      expect(statusElement).toHaveTextContent('Checked');
      expect(spy).toHaveBeenCalled();
    });

    it('should add and remove disabled state', function () {
      expect(checkboxElement).toHaveAttribute('data-disabled', 'false');
      expect(inputElement.tabIndex).toBe(0);
      expect(inputElement.disabled).toBe(false);

      rendered.rerender(<ExampleComponent disabled />);

      expect(checkboxElement).toHaveAttribute('data-disabled', 'true');
      expect(inputElement.disabled).toBe(true);

      rendered.rerender(<ExampleComponent disabled={false} />);

      expect(checkboxElement).toHaveAttribute('data-disabled', 'false');
      expect(inputElement.tabIndex).toBe(0);
      expect(inputElement.disabled).toBe(false);
    });

    it('should not toggle `checked` state upon interaction when disabled', function () {
      rendered.rerender(<ExampleComponent disabled/>);

      fireEvent.click(labelElement);

      expect(inputElement.checked).toBe(false);
      expect(statusElement).toHaveTextContent('Unchecked');
    });

    it('should generate a unique id for the checkbox input if no id is provided', function () {
      expect(checkboxElement.id.startsWith('sui-checkbox:')).toBe(true);
      expect(inputElement.id.startsWith('sui-checkbox:')).toBe(true);
      expect(inputElement.id.endsWith('input')).toBe(true);
    });

    it('should preserve the user-provided id', function () {
      rendered.rerender(<ExampleComponent id="simple-check" />);
      expect(checkboxElement.id).toBe('simple-check');
      expect(inputElement.id.startsWith('simple-check')).toBe(true);
      expect(inputElement.id.endsWith('input')).toBe(true);
    });

    it('should project the checkbox content into the label element', function () {
      expect(labelElement.textContent.trim()).toBe('Simple checkbox');
    });

    it('should pass the tabIndex to the input element', function () {
      expect(inputElement.tabIndex).toBe(0);
    });

    it('should acknowledge the label position property', function () {
      expect(checkboxElement).toHaveAttribute('data-label-before', 'false');
      rendered.rerender(<ExampleComponent labelPosition="before" />);

      expect(checkboxElement).toHaveAttribute('data-label-before', 'true');
    });

    it('should not trigger the click event multiple times', function () {
      // By default, when clicking on a label element, a generated click will be dispatched
      // on the associated input element.
      // Since we're using a label element and a visual hidden input, this behavior can led
      // to an issue, where the click events on the checkbox are getting executed twice.
      const spy = jest.fn();

      rendered.rerender(<ExampleComponent onClick={spy} />);

      expect(statusElement).toHaveTextContent('Unchecked');
      expect(inputElement.checked).toBe(false);
      expect(checkboxElement).toHaveAttribute('data-checked', 'false');

      fireEvent.click(labelElement);

      expect(inputElement.checked).toBe(true);
      expect(checkboxElement).toHaveAttribute('data-checked', 'true');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should trigger a change event when the native input does', function () {
      const spy = jest.fn();
      rendered.rerender(<ExampleComponent onChange={spy} />);

      expect(inputElement.checked).toBe(false);
      expect(checkboxElement).toHaveAttribute('data-checked', 'false');

      fireEvent.click(labelElement);

      expect(inputElement.checked).toBe(true);
      expect(checkboxElement).toHaveAttribute('data-checked', 'true');

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should forward the required attribute', function () {
      rendered.rerender(<ExampleComponent required />);

      expect(inputElement.required).toBe(true);

      rendered.rerender(<ExampleComponent required={false} />);

      expect(inputElement.required).toBe(false);
    });

    it('should forward the value to the input element', function () {
      rendered.rerender(<ExampleComponent value="basic-checkbox" />);

      expect(inputElement.value).toBe('basic-checkbox');
    });

    it('should remove the SVG checkmark path from the tab order', function () {
      expect(checkboxElement.querySelector('svg').getAttribute('focusable')).toBe('false');
    });

    it('should apply color attributes', function () {
      rendered.rerender(<ExampleComponent color="primary" />);
      expect(checkboxElement).toHaveAttribute('data-color', 'primary');

      rendered.rerender(<ExampleComponent color="accent" />);
      expect(checkboxElement).toHaveAttribute('data-color', 'accent');
    });
  });

  describe('change events', function () {
    let rendered;
    let spy;
    let timestampElement;
    let checkboxElement;
    /** @type {HTMLLabelElement} */
    let labelElement;
    /** @type {HTMLInputElement} */
    let inputElement;

    beforeEach(function () {
      spy = jest.fn();
      rendered = render(<CheckboxWithChangeEvent onChange={spy} />);
      timestampElement = rendered.queryByTestId(TIMESTAMP_TEST_ID);
      checkboxElement = rendered.queryByTestId(CHECKBOX_TEST_ID);
      labelElement = checkboxElement.querySelector('label');
      inputElement = checkboxElement.querySelector('input[type="checkbox"]');
    });

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should call the onChange handler when the value changes', function () {
      expect(spy).not.toHaveBeenCalled();

      fireEvent.click(labelElement);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit a DOM event', function () {
      expect(timestampElement).toBeEmpty();

      fireEvent.click(labelElement);

      expect(timestampElement).not.toBeEmpty();
    });
  });

  describe('aria-label', function () {
    let rendered;
    /** @type {HTMLElement} */
    let checkboxElement;
    /** @type {HTMLInputElement} */
    let inputElement;

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should use the provided aria-label', function () {
      rendered = render(<BasicCheckbox aria-label="Super effective" />);
      checkboxElement = rendered.queryByTestId(CHECKBOX_TEST_ID);
      inputElement = checkboxElement.querySelector('input[type="checkbox"]');

      expect(inputElement).toHaveAttribute('aria-label', 'Super effective');
    });

    it('should not set the aria-label attribute if no value is provided', function () {
      rendered = render(<ExampleComponent />);
      checkboxElement = rendered.queryByTestId(CHECKBOX_TEST_ID);
      inputElement = checkboxElement.querySelector('input[type="checkbox"]');

      expect(inputElement).not.toHaveAttribute('aria-label');
    });
  });

  describe('aria-labelledby', function () {
    let rendered;
    /** @type {HTMLElement} */
    let checkboxElement;
    /** @type {HTMLInputElement} */
    let inputElement;

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should use the provided aria-labelledby', function () {
      rendered = render(<BasicCheckbox aria-labelledby="some-id" />);
      checkboxElement = rendered.queryByTestId(CHECKBOX_TEST_ID);
      inputElement = checkboxElement.querySelector('input[type="checkbox"]');

      expect(inputElement).toHaveAttribute('aria-labelledby', 'some-id');
    });

    it('should not set the aria-label attribute if no value is provided', function () {
      rendered = render(<ExampleComponent />);
      checkboxElement = rendered.queryByTestId(CHECKBOX_TEST_ID);
      inputElement = checkboxElement.querySelector('input[type="checkbox"]');

      expect(inputElement).not.toHaveAttribute('aria-labelledby');
    });
  });

  describe('with provided tabIndex', function () {
    let rendered;
    /** @type {HTMLElement} */
    let checkboxElement;
    /** @type {HTMLInputElement} */
    let inputElement;

    beforeEach(function () {
      rendered = render(<BasicCheckbox tabIndex={7} />);
      checkboxElement = rendered.queryByTestId(CHECKBOX_TEST_ID);
      inputElement = checkboxElement.querySelector('input[type="checkbox"]');
    });

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should preserve the given tabIndex', function () {
      expect(inputElement.tabIndex).toBe(7);
    });

    it('should have a -1 tabIndex when disabled', function () {
      rendered.rerender(<BasicCheckbox disabled tabIndex={13} />);
      expect(inputElement.tabIndex).toBe(-1);
    });
  });

  describe('multiple checkboxes', function () {
    afterEach(function () {
      cleanup();
    });

    it('should assign a unique id to each checkbox', function () {
      const rendered = render(<MultipleCheckboxes />);
      const inputs = Array.from(rendered.container.querySelectorAll('input'));
      const [firstId, secondId] = inputs.map(input => input.id);

      expect(firstId.startsWith('sui-checkbox:')).toBe(true);
      expect(secondId.startsWith('sui-checkbox:')).toBe(true);
      expect(firstId).not.toEqual(secondId);
    });
  });

  describe('with name attribute', function () {
    afterEach(function () {
      cleanup();
    });

    it('should forward the name value to the input element', function () {
      const rendered = render(<BasicCheckbox name="test-name" />);
      const input = rendered.container.querySelector('input');

      expect(input).toHaveAttribute('name', 'test-name');
    });
  });

  // Todo: implement mutation observer with label to make sure that these tests pass.
  // Right now they're failing because there's no current way to detect when a label changes,
  // since it's passed as `children`.
  describe.skip('without label', function () {
    let rendered;
    /** @type {HTMLElement} */
    let checkboxElement;
    /** @type {HTMLElement} */
    let checkboxInnerContainer;

    beforeEach(function () {
      rendered = render(<CheckboxWithoutLabel />);
      checkboxElement = rendered.queryByTestId(CHECKBOX_TEST_ID);
      checkboxInnerContainer = checkboxElement.querySelector('[data-sui-tree="checkbox:inner-container"]');
    });

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should remove margin for checkbox without a label', async function () {
      await wait();
      expect(checkboxInnerContainer).toHaveAttribute('data-no-side-margin', 'true');
    });

    it('should not remove margin for labels that are added later', async function () {
      expect(checkboxInnerContainer).toHaveAttribute('data-no-side-margin', 'true');

      rendered.rerender(<CheckboxWithoutLabel label="Some content" />);
      await wait();

      expect(checkboxInnerContainer).toHaveAttribute('data-no-side-margin', 'false');
    });
  });
});

function ExampleComponent(props) {
  const [checked, setChecked] = React.useState(false);

  const onChange = React.useCallback((event) => {
    setChecked(event.target.checked);
    if (typeof props.onChange === 'function') {
      props.onChange(event);
    }
  }, [props.onChange, setChecked]);

  return (
    <div data-testid="wrapper">
      <Checkbox
        value={props.value}
        onChange={onChange}
        checked={checked}
        required={props.required}
        disabled={props.disabled}
        indeterminate={props.indeterminate}
        onIndeterminateChange={props.onIndeterminateChange}
        labelPosition={props.labelPosition}
        id={props.id}
        onClick={props.onClick}
        color={props.color}
        data-testid={CHECKBOX_TEST_ID}
      >Simple checkbox</Checkbox>
      <div data-testid={STATUS_TEST_ID}>{ checked ? 'Checked' : 'Unchecked' }</div>
    </div>
  );
}

ExampleComponent.defaultProps = {
  id: null,
};

function CheckboxWithChangeEvent(props) {
  const [lastTimeStamp, setLastTimeStamp] = React.useState(null);

  const handleChange = React.useCallback((event) => {
    setLastTimeStamp(event.timeStamp);
    if (typeof props.onChange === 'function') {
      props.onChange(event);
    }
  }, [setLastTimeStamp, props.onChange]);

  return (
    <div>
      <Checkbox
        {...props}
        onChange={handleChange}
        data-testid={CHECKBOX_TEST_ID}
      >Testing onChange</Checkbox>
      <p data-testid={TIMESTAMP_TEST_ID}>{ lastTimeStamp ? lastTimeStamp : null }</p>
    </div>
  );
}

function BasicCheckbox(props) {
  return (
    <Checkbox {...props} data-testid={CHECKBOX_TEST_ID}>
      Basic checkbox
    </Checkbox>
  );
}

function MultipleCheckboxes() {
  return (
    <React.Fragment>
      <Checkbox>Option 1</Checkbox>
      <Checkbox>Option 2</Checkbox>
    </React.Fragment>
  );
}

function CheckboxWithoutLabel({ label, ...restProps }) {
  return <Checkbox {...restProps} data-testid={CHECKBOX_TEST_ID}>{ label }</Checkbox>;
}
