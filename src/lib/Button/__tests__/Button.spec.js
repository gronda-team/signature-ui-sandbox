import * as React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { Button } from '../index';
import { BUTTON_APPEARANCE, BUTTON_SIZES, BUTTON_VARIANTS, BUTTON_WEIGHT } from '../util';
import { TestProviderWrapper } from '../../core';

const TestId = {
  BASIC_BUTTON: 'basic-button',
  STANDALONE_BUTTON: 'standalone-button',
  BASIC_ANCHOR: 'basic-anchor',
};

function customRender(app, options) {
  return render(app, { wrapper: TestProviderWrapper, ...options });
}

describe('Button', function () {
  let rendered;
  let button;
  let anchor;
  let spy;

  beforeEach(function () {
    spy = jest.fn();
    rendered = customRender(<ButtonSuite onClick={spy} />);
    button = rendered.queryByTestId(TestId.BASIC_BUTTON);
    anchor = rendered.queryByTestId(TestId.BASIC_ANCHOR);
  });

  afterEach(function () {
    rendered.unmount();
    cleanup();
    jest.clearAllMocks();
  });

  describe('appearance', function () {
    it('should apply data attributes based on color', function () {
      rendered.rerender(<ButtonSuite color="primary" />);

      expect(button).toHaveAttribute('data-color', 'primary');
      expect(anchor).toHaveAttribute('data-color', 'primary');

      rendered.rerender(<ButtonSuite color="accent" />);

      expect(button).toHaveAttribute('data-color', 'accent');
      expect(anchor).toHaveAttribute('data-color', 'accent');
    });

    it('should apply a default color of grey when no color is provided', function () {
      expect(button).toHaveAttribute('data-color', 'grey');
      expect(anchor).toHaveAttribute('data-color', 'grey');
    });

    it.each(
      BUTTON_VARIANTS
    )('should add data-type for %s buttons', function (variant) {
      rendered.rerender(<ButtonSuite variant={variant} />);
      expect(button).toHaveAttribute('data-type', variant);
      expect(anchor).toHaveAttribute('data-type', variant);
    });

    it('should be a data-type text button when none is provided', function () {
      expect(button).toHaveAttribute('data-type', 'text');
      expect(anchor).toHaveAttribute('data-type', 'text');
    });

    it('should not interfere with the native `type` attribute on the button', function () {
      expect(button).toHaveAttribute('type', 'button');

      rendered.rerender(<ButtonSuite buttonType="submit" />);

      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('data-type', 'text');
    });

    it.each(
      BUTTON_APPEARANCE
    )('should add data-appearance for %s buttons', function (appearance) {
      rendered.rerender(<ButtonSuite appearance={appearance} />);
      expect(button).toHaveAttribute('data-appearance', appearance);
      expect(anchor).toHaveAttribute('data-appearance', appearance);
    });

    it('should apply the default button type when no appearance prop is provided', function () {
      expect(button).toHaveAttribute('data-appearance', 'default');
      expect(anchor).toHaveAttribute('data-appearance', 'default');
    });

    it.each(
      BUTTON_SIZES
    )('should add data-size for %s buttons', function (size) {
      rendered.rerender(<ButtonSuite size={size} />);
      expect(button).toHaveAttribute('data-size', size);
      expect(anchor).toHaveAttribute('data-size', size);
    });

    it('should apply the medium size when no size prop is provided', function () {
      expect(button).toHaveAttribute('data-size', 'medium');
      expect(anchor).toHaveAttribute('data-size', 'medium');
    });

    it.each(
      BUTTON_WEIGHT
    )('should add data-sui-font-weight for %s buttons', function (weight) {
      rendered.rerender(<ButtonSuite weight={weight} />);
      expect(button).toHaveAttribute('data-sui-font-weight', weight);
      expect(anchor).toHaveAttribute('data-sui-font-weight', weight);
    });

    it('should apply the normal font weight when none is provided', function () {
      expect(button).toHaveAttribute('data-sui-font-weight', 'normal');
      expect(anchor).toHaveAttribute('data-sui-font-weight', 'normal');
    });

    it('should only apply data-stroke-width for stroked button types', function () {
      rendered.rerender(<ButtonSuite stroke="thick" />);
      expect(button).not.toHaveAttribute('data-stroke-width');
      expect(anchor).not.toHaveAttribute('data-stroke-width');

      rendered.rerender(<ButtonSuite appearance="stroked" stroke="thick" />);
      expect(button).toHaveAttribute('data-stroke-width', 'thick');
      expect(anchor).toHaveAttribute('data-stroke-width', 'thick');
    });

    it('should apply a default stroke width of thin ' +
      'when no stroke is provided for stroked buttons', function () {
      rendered.rerender(<ButtonSuite appearance="stroked" />);
      expect(button).toHaveAttribute('data-stroke-width', 'thin');
      expect(anchor).toHaveAttribute('data-stroke-width', 'thin');
    });

    it('should add a data-dense property when the button is dense', function () {
      expect(button).toHaveAttribute('data-dense', 'false');
      expect(anchor).toHaveAttribute('data-dense', 'false');

      rendered.rerender(<ButtonSuite dense />);
      expect(button).toHaveAttribute('data-dense', 'true');
      expect(anchor).toHaveAttribute('data-dense', 'true');
    });
  });

  describe('button types', function () {
    it('should handle a click on the button', function () {
      fireEvent.click(button);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not pass any click events if the button is disabled', function () {
      rendered.rerender(<ButtonSuite disabled onClick={spy} />);

      fireEvent.click(button);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should disable the native button element', function () {
      rendered.rerender(<ButtonSuite disabled />);

      expect(button.disabled).toBe(true);
    });
  });

  describe('anchor types', function () {
    it('should not redirect if disabled', function () {
      rendered.rerender(<ButtonSuite disabled />);

      fireEvent.click(anchor);
    });

    it('should remove tabIndex if disabled', function () {
      expect(anchor).toHaveAttribute('tabindex', '0');
      expect(anchor.tabIndex).toBe(0);

      rendered.rerender(<ButtonSuite disabled />);

      expect(anchor).toHaveAttribute('tabindex', '-1');
      expect(anchor.tabIndex).toBe(-1);
    });

    it('should add aria-disabled attribute if disabled', function () {
      expect(anchor).toHaveAttribute('aria-disabled', 'false');

      rendered.rerender(<ButtonSuite disabled />);

      expect(anchor).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not add a disabled attribute if it is not disabled', function () {
      expect(anchor).toHaveAttribute('aria-disabled', 'false');
      expect(anchor).not.toHaveAttribute('disabled');

      rendered.rerender(<ButtonSuite disabled />);

      expect(anchor).toHaveAttribute('aria-disabled', 'true');
      expect(anchor).toHaveAttribute('disabled');
    });

    it('should be able to set a custom tabindex', function () {
      rendered.rerender(<ButtonSuite tabIndex={3} />);

      expect(anchor).toHaveAttribute('tabindex', '3');

      rendered.rerender(<ButtonSuite tabIndex={3} disabled />);

      expect(anchor).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('miscellaneous', function () {
    it('should add custom props', function () {
      const standaloneRender = customRender(
        <StandaloneButton data-random-attribute="42" />,
      );

      button = standaloneRender.queryByTestId(TestId.STANDALONE_BUTTON);

      expect(button).toHaveAttribute('data-random-attribute', '42');
    });
  });
});

function StandaloneButton(props) {
  return <Button {...props} data-testid={TestId.STANDALONE_BUTTON}>Hello, world!</Button>;
}

function ButtonSuite({ tabIndex, onClick, disabled, buttonType, ...restProps }) {
  const [clickCount, setClickCount] = React.useState(0);

  const handleClickIncrement = React.useCallback((event) => {
    setClickCount(count => count + 1);
    if (typeof onClick === 'function') {
      onClick(event)
    }
  }, [onClick, setClickCount]);

  return (
    <div>
      <Button
        tabIndex={tabIndex}
        type={buttonType}
        onClick={handleClickIncrement}
        disabled={disabled}
        data-testid={TestId.BASIC_BUTTON}
        {...restProps}
      >
        Go
      </Button>
      <Button
        tabIndex={tabIndex}
        as="a"
        href="https://gronda.eu"
        disabled={disabled}
        data-testid={TestId.BASIC_ANCHOR}
        {...restProps}
      >
        Home
      </Button>
    </div>
  );
}

ButtonSuite.defaultProps = {
  buttonType: 'button',
};
