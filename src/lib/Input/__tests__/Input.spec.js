import * as React from 'react';
import head from 'lodash/head';
import '@testing-library/jest-dom/extend-expect';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { FormField, Hint } from '../../FormField';
import { Input } from '../exports';
import { TestProviderWrapper } from '../../core';

const TestId = {
  INPUT: 'input',
  FORM_FIELD: 'form-field',
};

function customRender(app, ...options) {
  return render(app, { wrapper: TestProviderWrapper, ...options });
}

describe('Input', function () {
  describe('basic behavior', function () {
    let rendered;
    /** @type {HTMLInputElement} */
    let input;
    /** @type {HTMLLabelElement} */
    let label;

    beforeEach(function () {
      rendered = customRender(<BasicInput />);
      const formField = rendered.queryByTestId(TestId.FORM_FIELD);
      input = formField.querySelector('input');
      label = formField.querySelector('label');
    });

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should have an id', function () {
      expect(input.id).toBeTruthy();
      expect(input.id.startsWith('sui-input')).toBe(true);
      expect(input.id).toEqual(label.htmlFor);
    });

    it('should add aria-owns to the label element', function () {
      expect(label.getAttribute('aria-owns')).toEqual(input.id);
    });

    it('should add aria-required when the input is required', function () {
      expect(input.getAttribute('aria-required')).toBe('false');
      rendered.rerender(<BasicInput required />);
      expect(input.getAttribute('aria-required')).toBe('true');
    });

    it('should not overwrite existing id', function () {
      rendered.rerender(<BasicInput id="test-id" />);
      expect(input.id).toBe('test-id');
      expect(label.htmlFor).toBe('test-id');
    });

    it('should support placeholder attribute', function () {
      rendered.rerender(<BasicInput placeholder={null} />);

      expect(label).toHaveTextContent('');
      expect(input.placeholder).toBe('');

      rendered.rerender(<BasicInput placeholder="Test placeholder" />);

      expect(label).toHaveTextContent('Test placeholder');
      expect(input.placeholder).toBe('Test placeholder');
    });
  });

  describe('placeholder and required attributes', function () {
    let rendered;
    let label;
    let star;

    beforeEach(function () {
      rendered = customRender(<BasicInputWithRequiredMarker required placeholder="Hello" />);
      label = rendered.container.querySelector('label');
      star = rendered.container.querySelector('[data-sui-tree="form-field:required-marker"]');
    });

    afterEach(function () {
      cleanup();
    });

    it('should bind the required attribute to the input element', function () {
      expect(rendered.container.querySelector('input').required).toBe(true);
    });

    it('should support the placeholder required star', function () {
      expect(label).toHaveTextContent('Hello *');
    });

    it('should remove the required star for disabled inputs', function () {
      rendered.rerender(<BasicInputWithRequiredMarker required placeholder="Hello" disabled />);
      expect(label).toHaveTextContent('Hello');
    });

    it('should hide the required star from screen readers', function () {
      expect(star).toHaveAttribute('aria-hidden', 'true');
    });

    it('should hide required marker when form field hides required marker', function () {
      expect(star).toBeInTheDocument();
      rendered.rerender(
        <BasicInputWithRequiredMarker required placeholder="Hello" hideRequiredMarker />
      );
      expect(star).not.toBeInTheDocument();
    });
  });

  describe('hints', function () {
    let rendered;
    /** @type {HTMLInputElement} */
    let input;
    /** @type {HTMLElement} */
    let hint;

    beforeEach(function () {
      rendered = customRender(<BasicInputWitHints hint="Hint" />);
      const formField = rendered.queryByTestId(TestId.FORM_FIELD);
      input = formField.querySelector('input');
      hint = formField.querySelector('[data-sui-tree="form-field:hint"]');
    });

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should set an id on the hint element', function () {
      expect(hint.id).toBeTruthy();
    });

    it('should set the aria-describedby with hints', function () {
      expect(input.getAttribute('aria-describedby'))
        .toEqual(hint.id);
    });

    it('should not overwrite hint id', function () {
      rendered.rerender(<BasicInputWitHints hintId="test-id" />);
      expect(hint.id).toBe('test-id');
      expect(input.getAttribute('aria-describedby')).toEqual('test-id');
    });

    describe('dynamic hints via portals', function () {
      let queryHints = container => container.querySelectorAll('[data-sui-tree="form-field:hint"]');
      let input;
      beforeEach(function () {
        rendered = customRender(<InputWithDynamicHints />);
        input = rendered.container.querySelector('input');
      });

      afterEach(function () {
        cleanup();
      });

      it('should inject hint elements into the portal', function () {
        expect(queryHints(rendered.container).length).toBe(0);
        rendered.rerender(<InputWithDynamicHints showStartHint />);
        expect(queryHints(rendered.container).length).toBe(1);
        rendered.rerender(<InputWithDynamicHints showStartHint showEndHint />);
        expect(queryHints(rendered.container).length).toBe(2);
      });

      it('should clear hints dynamically', function () {
        expect(queryHints(rendered.container).length).toBe(0);
        rendered.rerender(<InputWithDynamicHints showStartHint showEndHint />);
        expect(queryHints(rendered.container).length).toBe(2);
        rendered.rerender(<InputWithDynamicHints />);
        expect(queryHints(rendered.container).length).toBe(0);
      });

      it('should dynamically update the aria-describedby attribute for the input', function () {
        expect(input).not.toHaveAttribute('aria-describedby');

        rendered.rerender(<InputWithDynamicHints showStartHint />);
        const singleHint = queryHints(rendered.container);
        expect(input.getAttribute('aria-describedby')).toEqual(head(singleHint).id);

        rendered.rerender(<InputWithDynamicHints showStartHint showEndHint />);
        const hints = queryHints(rendered.container);
        expect(input.getAttribute('aria-describedby'))
          .toEqual(Array.from(hints).map(hint => hint.id).join(' '));

        rendered.rerender(<InputWithDynamicHints />);
        expect(input).not.toHaveAttribute('aria-describedby');
      });
    });
  });

  describe('actions', function () {
    let rendered;
    /** @type {HTMLElement} */
    let formField;
    /** @type {HTMLInputElement} */
    let input;

    beforeEach(function () {
      rendered = customRender(<BasicInput />);
      formField = rendered.queryByTestId(TestId.FORM_FIELD);
      input = formField.querySelector('input');
    });

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should bind the data-focused attribute', function () {
      expect(formField).toHaveAttribute('data-focused', 'false');
      fireEvent.focus(input);
      expect(formField).toHaveAttribute('data-focused', 'true');
    });

    it('should toggle data-focused when input becomes disabled while focused', function () {
      fireEvent.focus(input);
      expect(formField).toHaveAttribute('data-focused', 'true');

      rendered.rerender(<BasicInput disabled />);

      expect(formField).toHaveAttribute('data-focused', 'false');
    });

    it('should not have the data-focused attribute when focusing readonly input', function () {
      rendered.rerender(<BasicInput readOnly />);
      fireEvent.focus(input);

      expect(formField).toHaveAttribute('data-focused', 'false');
    });
  });
});

function BasicInput(props) {
  return (
    <FormField data-testid={TestId.FORM_FIELD}>
      <Input {...props} />
    </FormField>
  );
}

BasicInput.defaultProps = {
  placeholder: 'Test',
};

function BasicInputWithRequiredMarker({ required, hideRequiredMarker, ...restProps }) {
  return (
    <FormField data-testid={TestId.FORM_FIELD} hideRequiredMarker={hideRequiredMarker}>
      <Input {...restProps} required={required} />
    </FormField>
  );
}

function BasicInputWitHints({ hint, hintId, ...restProps }) {
  return (
    <FormField data-testid={TestId.FORM_FIELD}>
      <Input {...restProps} />
      <Hint id={hintId}>{ hint }</Hint>
    </FormField>
  );
}

function InputWithDynamicHints({ showStartHint, showEndHint, ...restProps }) {
  return (
    <FormField data-testid={TestId.FORM_FIELD}>
      <Input {...restProps} />
      { showStartHint ? <Hint align="start">Start hint</Hint> : null }
      { showEndHint ? <Hint align="end">End hint</Hint> : null }
    </FormField>
  );
}
