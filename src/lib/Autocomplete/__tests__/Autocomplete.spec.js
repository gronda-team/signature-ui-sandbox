import * as React from 'react';
import { render, cleanup, createEvent, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import times from 'lodash/times';
import { FormField } from '../../FormField';
import { Input } from '../../Input';
import { Autocomplete } from '../exports';
import { Option, OptGroup, TestProviderWrapper } from '../../core';
import { DOWN_ARROW, ENTER, ESCAPE, SPACE, TAB, UP_ARROW } from '../../../cdk/Keycodes';
import { Directionality } from '../../../cdk/Bidi';

const DOWN_EVENT = { keyCode: DOWN_ARROW };
const UP_EVENT = { keyCode: UP_ARROW };
const ENTER_EVENT = { keyCode: ENTER };
const SPACE_EVENT = { keyCode: SPACE };

describe('Autocomplete', function () {
  afterEach(function () {
    cleanup();
    jest.clearAllMocks();
  });

  it('should be able to set a custom value for the `autoComplete` attribute', function () {
    const rendered = render(
      <SimpleAutocomplete autoComplete="something" />,
      { wrapper: TestProviderWrapper },
    );

    const input = rendered.container.querySelector('input');
    expect(input).toHaveAttribute('autocomplete', 'something');
  });

  describe('Panel toggling', function () {
    let rendered;
    let overlayContainer;
    let input;
    const openedSpy = jest.fn();
    const closedSpy = jest.fn();
    beforeEach(function () {
      rendered = render(
        <SimpleAutocomplete onOpen={openedSpy} onClose={closedSpy} />,
        { wrapper: TestProviderWrapper },
      );

      overlayContainer = document.querySelector('div[data-sui-overlay-root]');
      input = rendered.container.querySelector('input');
    });

    it('should open the panel when the input is focused', function () {
      expect(overlayContainer.children).toHaveLength(0);
      fireEvent.focus(input);

      expect(overlayContainer.children).toHaveLength(1);
      expect(overlayContainer).toHaveTextContent('Alabama');
      expect(overlayContainer).toHaveTextContent('California');
    });

    it('should not open the panel if the input is readonly', function () {
      rendered.rerender(<SimpleAutocomplete readOnly />);
      expect(overlayContainer.children).toHaveLength(0);
      fireEvent.focus(input);

      expect(overlayContainer.children).toHaveLength(0);
    });

    it('should not open using the arrow keys when the input is readonly', function () {
      rendered.rerender(<SimpleAutocomplete readOnly />);
      expect(overlayContainer.children).toHaveLength(0);
      fireEvent.keyDown(input, DOWN_EVENT);

      expect(overlayContainer.children).toHaveLength(0);
    });

    it('should close the panel when the user clicks away', function () {
      fireEvent.focus(input);
      fireEvent.click(document);

      expect(overlayContainer.children).toHaveLength(0);
      expect(overlayContainer.textContent).toBe('');
    });

    it('should close the panel when the user taps away on a touch device', function () {
      fireEvent.focus(input);
      fireEvent.touchEnd(document);

      expect(overlayContainer.children).toHaveLength(0);
      expect(overlayContainer.textContent).toBe('');
    });

    it('should close the panel when an option is clicked', function () {
      fireEvent.focus(input);

      const option = overlayContainer.querySelector('[data-sui="option"]');
      fireEvent.click(option);

      expect(overlayContainer.children).toHaveLength(0);
      expect(overlayContainer.textContent).toBe('');
    });

    it('should close the panel when a newly created option is clicked', function () {
      fireEvent.focus(input);
      // Filter down the option list to a subset of original options ('Alabama', 'California')
      fireEvent.change(input, { target: { value: 'al' } });

      const option = overlayContainer.querySelector('[data-sui="option"]');
      fireEvent.click(option);
      // Now the input field has "Alabama" in it. Change the input field again to `al` to
      // have `California` created anew
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'al' } });
      const allOptions = overlayContainer.querySelectorAll('[data-sui="option"]');
      fireEvent.click(allOptions[1]);

      expect(overlayContainer.children).toHaveLength(0);
      expect(overlayContainer.textContent).toBe('');
    });

    it('should hide the panel when the option list is empty', function () {
      fireEvent.focus(input);
      const panel = overlayContainer.querySelector('[data-sui="autocomplete"]');
      expect(panel).toHaveAttribute('data-visibility', 'visible');

      // Filter down the option list such that no options match the value
      fireEvent.change(input, { target: { value: 'af' } });
      expect(panel).toHaveAttribute('data-visibility', 'hidden');
    });

    it('should not open the panel when the `input` event ' +
      'is invoked on a non-focused input', function () {
      fireEvent.change(input, { target: { value: 'Alabama' } });

      expect(overlayContainer.children).toHaveLength(0);
    });

    it('should toggle visibility when typing and closing the panel', function () {
      fireEvent.focus(input);
      const panel = overlayContainer.querySelector('[data-sui="autocomplete"]');
      expect(panel).toHaveAttribute('data-visibility', 'visible');

      fireEvent.change(input, { target: { value: 'x' } });
      expect(panel).toHaveAttribute('data-visibility', 'hidden');

      fireEvent.change(input, { target: { value: '' } });
      fireEvent.change(input, { target: { value: 'al' } });

      expect(panel).toHaveAttribute('data-visibility', 'visible');
    });

    it('should call the `onOpen` callback when the panel is opened', function () {
      fireEvent.focus(input);
      expect(openedSpy).toHaveBeenCalled();
    });

    it('should not call the `onOpen` callback when there are no options shown', function () {
      fireEvent.change(input, { target: { value: 'x' } });
      fireEvent.focus(input);

      expect(openedSpy).not.toHaveBeenCalled();
    });

    it('should call the `onOpen` callback when the options come later', function () {
      fireEvent.change(input, { target: { value: 'x' } });
      fireEvent.focus(input);
      expect(openedSpy).not.toHaveBeenCalled();

      fireEvent.change(input, { target: { value: 'al' } });
      expect(openedSpy).toHaveBeenCalled();
    });

    it('should not call the `onOpen` callback multiple times while typing', function () {
      fireEvent.focus(input);
      expect(openedSpy).toHaveBeenCalledTimes(1);

      fireEvent.change(input, { target: { value: 'Alabam' } });
      expect(openedSpy).toHaveBeenCalledTimes(1);
    });

    it('should call the `onClose` callback when closing', function () {
      fireEvent.focus(input);
      fireEvent.click(document);

      expect(closedSpy).toHaveBeenCalled();
    });

    it('should not call the `onClose` callback when no options are shown', function () {
      fireEvent.change(input, { target: { value: 'x' } });
      fireEvent.focus(input);
      fireEvent.click(document);

      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('should not be able to open the panel if the autocomplete is disabled', function () {
      expect(overlayContainer.children).toHaveLength(0);
      rendered.rerender(<SimpleAutocomplete autocompleteDisabled />);

      fireEvent.focus(input);
      expect(overlayContainer.children).toHaveLength(0);
    });

    it('should still allow the user to type in the input field ' +
      'even when the autocomplete is disabled', function () {
      rendered.rerender(<SimpleAutocomplete autocompleteDisabled />);
      fireEvent.change(input, { target: { value: 'Al' } });
      expect(input).toHaveValue('Al');
    });

    it('should set `aria-haspopup` depending on if the autocomplete is disabled', function () {
      expect(input).toHaveAttribute('aria-haspopup', 'true');
      rendered.rerender(<SimpleAutocomplete autocompleteDisabled />);
      expect(input).toHaveAttribute('aria-haspopup', 'false');
    });

    it('should not close the panel when clicking on the input', function () {
      fireEvent.focus(input);
      expect(overlayContainer.children).toHaveLength(1);

      fireEvent.click(input);
      expect(overlayContainer.children).toHaveLength(1);
    });
  });

  describe('RTL', function () {
    let rendered;
    let overlayContainer;
    let input;

    beforeEach(function () {
      rendered = render(
        <Directionality dir="rtl">
          <SimpleAutocomplete />
        </Directionality>,
        { wrapper: TestProviderWrapper },
      );
      overlayContainer = document.querySelector('div[data-sui-overlay-root]');
      input = rendered.container.querySelector('input');
    });

    it('should have the correct text direction in rtl', function () {
      fireEvent.focus(input);
      const host = document.querySelector('[data-sui-tree="overlay:host"]');
      expect(host).toHaveAttribute('dir', 'rtl');
    });

    it('should update the panel if the direction changes', function () {
      fireEvent.focus(input);
      const host = document.querySelector('[data-sui-tree="overlay:host"]');
      expect(host).toHaveAttribute('dir', 'rtl');
      fireEvent.click(document);

      rendered.rerender(
        <Directionality dir="ltr">
          <SimpleAutocomplete />
        </Directionality>
      );

      fireEvent.focus(input);
      expect(host).toHaveAttribute('dir', 'ltr');
    });
  });

  describe('keyboard events', function () {
    let rendered;
    let overlayContainer;
    let input;
    let options;
    let panel;

    const openedSpy = jest.fn();
    const closedSpy = jest.fn();

    beforeEach(function () {
      rendered = render(
        <SimpleAutocomplete onOpen={openedSpy} onClose={closedSpy} />,
        { wrapper: TestProviderWrapper },
      );

      overlayContainer = document.querySelector('div[data-sui-overlay-root]');
      input = rendered.container.querySelector('input');

      // Open up the panel at first
      fireEvent.focus(input);
      options = overlayContainer.querySelectorAll('[data-sui="option"]');
      panel = overlayContainer.querySelector('[data-sui="autocomplete"]');
    });

    it('should not close the panel when the down key is pressed', function () {
      fireEvent.keyDown(input, DOWN_EVENT);
      expect(overlayContainer.children).toHaveLength(1);
      expect(overlayContainer).toHaveTextContent('Alabama');
      expect(overlayContainer).toHaveTextContent('California');
    });

    it('should not focus the option when the down key is pressed', function () {
      const focusSpy = jest.spyOn(options[0], 'focus');

      fireEvent.keyDown(input, DOWN_EVENT);
      expect(focusSpy).not.toHaveBeenCalled();
    });

    it('should set the active item to the first option when the down key is pressed', function () {
      fireEvent.keyDown(input, DOWN_EVENT);
      expect(options[0]).toHaveAttribute('data-active', 'true');
      expect(options[1]).not.toHaveAttribute('data-active', 'true');

      fireEvent.keyDown(input, DOWN_EVENT);
      expect(options[0]).not.toHaveAttribute('data-active', 'true');
      expect(options[1]).toHaveAttribute('data-active', 'true');
    });

    it('should set the active item to the last option when the up key is pressed', function () {
      fireEvent.keyDown(input, UP_EVENT);
      expect(options[10]).toHaveAttribute('data-active', 'true');
      expect(options[0]).not.toHaveAttribute('data-active', 'true');

      fireEvent.keyDown(input, DOWN_EVENT);
      expect(options[10]).not.toHaveAttribute('data-active', 'true');
      expect(options[0]).toHaveAttribute('data-active', 'true');
    });

    it('should set the active item properly after filtering', function () {
      fireEvent.change(input, { target: { value: 'o' } });
      fireEvent.keyDown(input, DOWN_EVENT);

      const filteredOptions = overlayContainer.querySelectorAll('[data-sui="option"]');

      expect(filteredOptions[0]).toHaveAttribute('data-active', 'true');
      expect(filteredOptions[1]).not.toHaveAttribute('data-active', 'true');
    });

    it('should fill the text field when an option is selected with Enter', function () {
      fireEvent.keyDown(input, DOWN_EVENT);
      fireEvent.keyDown(input, ENTER_EVENT);
      expect(input).toHaveValue('Alabama');
    });

    it('should prevent the default enter key action', function () {
      const enterEvent = createEvent.keyDown(input, ENTER_EVENT);
      fireEvent.keyDown(input, DOWN_EVENT);
      fireEvent(input, enterEvent);

      expect(enterEvent.defaultPrevented).toBe(true);
    });

    it('should not prevent the default action when the panel is closed', function () {
      fireEvent.click(document);
      const enterEvent = createEvent.keyDown(input, ENTER_EVENT);
      fireEvent(input, enterEvent);

      expect(enterEvent.defaultPrevented).toBe(false);
    });

    it('should fill the text field (not select option) when space is entered', function () {
      fireEvent.change(input, { target: { value: 'New' } });
      fireEvent.keyDown(input, DOWN_EVENT);
      fireEvent.keyDown(input, SPACE_EVENT);

      expect(input).not.toHaveValue('New York');
    });

    it('should open the panel again when typing after making a selection', function () {
      fireEvent.keyDown(input, DOWN_EVENT);
      fireEvent.keyDown(input, ENTER_EVENT);
      expect(overlayContainer.children).toHaveLength(0);
      expect(overlayContainer.textContent).toBe('');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.change(input, { target: { value: 'Alabama' } });
      expect(overlayContainer.children).toHaveLength(1);
      expect(overlayContainer).toHaveTextContent('Alabama');
    });

    it('should not open the panel if the `input` event ' +
      'was dispatched with changing the value', function () {
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Alabama' } });
      expect(overlayContainer.children).toHaveLength(1);

      fireEvent.click(document);
      expect(overlayContainer.children).toHaveLength(0);

      // Dispatch the event without actually changing the value
      // to simulate what happen in some cases on IE.
      fireEvent.input(input);
      expect(overlayContainer.children).toHaveLength(0);
    });

    it('should scroll to active options below the fold', function () {
      fireEvent.keyDown(input, DOWN_EVENT);
      expect(panel.scrollTop).toBe(0);

      // These down arrows will set the 6th option active, below the fold.
      times(5, () => fireEvent.keyDown(input, DOWN_EVENT));

      // Expect option bottom minus the panel height
      expect(panel.scrollTop).toBe(32);
    });

    it('should scroll to active options when pressing the up arrow', function () {
      fireEvent.keyDown(input, UP_EVENT);
      expect(panel.scrollTop).toBe(272);
    });

    it('should not scroll to active options that are fully in the panel', function () {
      fireEvent.keyDown(input, DOWN_EVENT);
      expect(panel.scrollTop).toBe(0);

      // These down arrows will set the 6th option active, below the fold.
      times(5, () => fireEvent.keyDown(input, DOWN_EVENT));

      // Expect option bottom minus the panel height (288 - 256 = 32)
      expect(panel.scrollTop).toBe(32);

      // These up arrows will set the 2nd option active
      times(4, () => fireEvent.keyDown(input, UP_EVENT));
      expect(panel.scrollTop).toBe(32);
    });

    it('should scroll to active options that are above the panel', function () {
      fireEvent.keyDown(input, DOWN_EVENT);
      expect(panel.scrollTop).toBe(0);

      // These down arrows will set the 7th option active, below the fold.
      times(6, () => fireEvent.keyDown(input, DOWN_EVENT));

      // These up arrows will set the 2nd option active
      times(5, () => fireEvent.keyDown(input, UP_EVENT));

      expect(panel.scrollTop).toBe(48);
    });

    it('should close the panel when pressing escape', function () {
      // Must use native event because fireEvent.focus doesn't set `document.activeElement`
      input.focus();
      expect(input).toHaveFocus();
      expect(overlayContainer.children).toHaveLength(1);

      fireEvent.keyDown(document.body, { keyCode: ESCAPE });
      // Should still be focused
      expect(input).toHaveFocus();
      expect(overlayContainer.children).toHaveLength(0);
    });

    it('should prevent the default action when pressing escape', function () {
      const escapeEvent = createEvent.keyDown(input, { keyCode: ESCAPE });
      fireEvent(input, escapeEvent);
      expect(escapeEvent.defaultPrevented).toBe(true);
    });

    it('should close the panel when pressing Alt + Up Arrow', function () {
      const upArrowEvent = createEvent.keyDown(input, { keyCode: UP_ARROW, altKey: true });
      const stopPropagationSpy = jest.spyOn(upArrowEvent, 'stopPropagation');
      input.focus();
      expect(input).toHaveFocus();
      expect(overlayContainer.children).toHaveLength(1);

      fireEvent(document.body, upArrowEvent);
      // Should still be focused
      expect(input).toHaveFocus();
      expect(overlayContainer.children).toHaveLength(0);
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should close the panel when tabbing away from the ' +
      'trigger without results', function () {
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'x' } });

      fireEvent.keyDown(input, { keyCode: TAB });
      expect(overlayContainer.children).toHaveLength(0);
    });
  });

  describe('a11y', function () {
    let rendered;
    let input;

    beforeEach(function () {
      rendered = render(
        <SimpleAutocomplete />,
        { wrapper: TestProviderWrapper },
      );

      input = rendered.container.querySelector('input');

    });

    it('should set the `role` of the input to `combobox`', function () {
      expect(input).toHaveAttribute('role', 'combobox');
    });

    it('should set the `role` of autocomplete panel to `listbox`', function () {
      fireEvent.focus(input);
      const panel = document.querySelector('[data-sui="autocomplete"]');
      expect(panel).toHaveAttribute('role', 'listbox');
    });

    it('should set `aria-autocomplete` to `list`', function () {
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('should set the `aria-activedescendant` based on the active option', function () {
      fireEvent.focus(input);
      expect(input).not.toHaveAttribute('aria-activedescendant');

      fireEvent.keyDown(input, DOWN_EVENT);
      const firstOption = document.querySelector('[data-sui="option"]');
      expect(input).toHaveAttribute('aria-activedescendant', firstOption.id);
    });

    it('should set `aria-expanded` based on whether the panel is open', function () {
      expect(input).toHaveAttribute('aria-expanded', 'false');
      fireEvent.focus(input);
      expect(input).toHaveAttribute('aria-expanded', 'true');
      fireEvent.click(document);
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    it('should set `aria-expanded` when the panel is hidden', function () {
      fireEvent.focus(input);
      expect(input).toHaveAttribute('aria-expanded', 'true');
      fireEvent.change(input, { target: { value: 'zz' } });
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    it('should set `aria-owns` based on the attached autocomplete', function () {
      fireEvent.focus(input);
      const panel = document.querySelector('[data-sui="autocomplete"]');
      expect(input).toHaveAttribute('aria-owns', panel.id);
    });

    it('should not set `aria-owns` when the autocomplete is closed', function () {
      expect(input).not.toHaveAttribute('aria-owns');
      fireEvent.focus(input);
      expect(input).toHaveAttribute('aria-owns');
      fireEvent.click(document);
      expect(input).not.toHaveAttribute('aria-owns');
    });

    it('should restore focus to the input when clicking to select a value', function () {
      fireEvent.focus(input);

      const option = document.querySelector('[data-sui="option"]');

      // Focus the option manually since the synthetic click may not do it.
      option.focus();
      fireEvent.click(option);

      expect(input).toHaveFocus();
    });

    it('should remove autocomplete-specific attributes when it is disabled', function () {
      rendered.rerender(<SimpleAutocomplete autocompleteDisabled />);
      expect(input).not.toHaveAttribute('role');
      expect(input).not.toHaveAttribute('aria-autocomplete');
      expect(input).not.toHaveAttribute('aria-expanded');
      expect(input).not.toHaveAttribute('aria-owns');
    });

    it('should omit autocomplete-specific attributes ' +
      'when `data-sui-autocomplete` is not present', function () {
      const otherField = render(
        <FormField><Input /></FormField>,
        { wrapper: TestProviderWrapper },
      );

      const otherInput = otherField.container.querySelector('input');
      expect(otherInput).not.toHaveAttribute('role');
      expect(otherInput).not.toHaveAttribute('aria-autocomplete');
      expect(otherInput).not.toHaveAttribute('aria-expanded');
      expect(otherInput).not.toHaveAttribute('aria-owns');
    });
  });

  describe('autoActiveFirstOption', function () {
    let rendered;
    let overlayContainer;
    let input;

    beforeEach(function () {
      rendered = render(
        <SimpleAutocomplete autoActiveFirstOption />,
        { wrapper: TestProviderWrapper },
      );

      overlayContainer = document.querySelector('div[data-sui-overlay-root]');
      input = rendered.container.querySelector('input');
    });

    it('should be able to preselect the first option', function () {
      fireEvent.focus(input);
      fireEvent.click(document);
      fireEvent.focus(input);

      const options = overlayContainer.querySelectorAll('[data-sui="option"]');
      expect(options[0]).toHaveAttribute('data-active', 'true');
    });

    it('should remove `aria-activedescendant` when panel is closed with `autoActiveFirstOption`', function () {
      expect(input).not.toHaveAttribute('aria-activedescendant');

      fireEvent.focus(input);
      expect(input).toHaveAttribute('aria-activedescendant');

      fireEvent.click(document);
      expect(input).not.toHaveAttribute('aria-activedescendant');
    });
  });

  describe('panel closing', function () {
    let rendered;
    let overlayContainer;
    let input;
    const closeSpy = jest.fn();

    beforeEach(function () {
      rendered = render(
        <SimpleAutocomplete onClose={closeSpy} />,
        { wrapper: TestProviderWrapper },
      );

      overlayContainer = document.querySelector('div[data-sui-overlay-root]');
      input = rendered.container.querySelector('input');
      // Open the panel
      fireEvent.focus(input);
    });

    it('should call `onClose` when clicking away', function () {
      expect(closeSpy).not.toHaveBeenCalled();
      fireEvent.click(document);
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should call `onClose` when tabbing out', function () {
      expect(closeSpy).not.toHaveBeenCalled();
      fireEvent.keyDown(input, { keyCode: TAB });
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should not call `onClose` when tabbing away from a closed panel', function () {
      fireEvent.keyDown(input, { keyCode: TAB });
      // Emitted upon closing
      expect(closeSpy).toHaveBeenCalledTimes(1);
      fireEvent.keyDown(input, { keyCode: TAB });
      // Should not be emitted now that it's closed
      expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it('should call `onClose` when selecting an option', function () {
      const option = overlayContainer.querySelector('[data-sui="option"]');
      expect(closeSpy).not.toHaveBeenCalled();
      fireEvent.click(option);
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should call `onClose` when pressing escape', function () {
      expect(closeSpy).not.toHaveBeenCalled();
      fireEvent.keyDown(document.body, { keyCode: ESCAPE });
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('option groups', function () {
    let rendered;
    let input;
    let panel;

    beforeEach(function () {
      rendered = render(
        <AutocompleteWithGroups />,
        { wrapper: TestProviderWrapper },
      );

      input = rendered.container.querySelector('input');
      fireEvent.focus(input);
      panel = document.querySelector('[data-sui="autocomplete"]');
    });

    it('should scroll to active options below the fold', function () {
      fireEvent.keyDown(input, DOWN_EVENT);
      expect(panel.scrollTop).toBe(0);

      times(5, () => fireEvent.keyDown(input, DOWN_EVENT));

      // <option bottom> - <panel height> + <2x group labels> = 128
      // 288 - 256 + 96 = 128
      expect(panel.scrollTop).toBe(128);
    });

    it('should scroll to active options on UP arrow', function() {
      fireEvent.keyDown(input, UP_EVENT);

      // <option bottom> - <panel height> + <3x group label> = 464
      // 576 - 256 + 144 = 464
      expect(panel.scrollTop).toBe(464);
    });

    it('should scroll to the active option when new groups are made', function () {
      // Show the second group
      fireEvent.change(input, { target: { value: 'Il' } });
      let options = panel.querySelectorAll('[data-sui="option"]');

      // Select the first option
      fireEvent.click(options[0]);

      // Refocus the panel
      fireEvent.click(document);
      fireEvent.focus(input);

      // Clear the panel
      fireEvent.change(input, { target: { value: '' } });

      // Groups are now visible. Try scrolling up. It should be at the bottom
      fireEvent.keyDown(input, UP_EVENT);

      // <option bottom> - <panel height> + <3x group label> = 464
      // 576 - 256 + 144 = 464
      expect(panel.scrollTop).toBe(464);
    });

    it('should scroll to active options that are above the panel', function() {
      fireEvent.keyDown(input, DOWN_EVENT);
      expect(panel.scrollTop).toBe(0);

      // These down arrows will set the 7th option active, below the fold.
      times(6, () => fireEvent.keyDown(input, DOWN_EVENT));

      // These up arrows will set the 2nd option active
      times(5, () => fireEvent.keyDown(input, UP_EVENT));

      // Expect to show the top of the 2nd option at the top of the panel.
      // It is offset by 48, because there's a group label above it.
      expect(panel.scrollTop).toBe(96);
    });

    it('should scroll back to the top ' +
      'when reaching the first option with preceding group label', function() {
      fireEvent.keyDown(input, DOWN_EVENT);
      expect(panel.scrollTop).toBe(0);

      // Press the down arrow five times.
      times(5, () => fireEvent.keyDown(input, DOWN_EVENT));

      // Press the up arrow five times.
      times(5, () => fireEvent.keyDown(input, UP_EVENT));

      expect(panel.scrollTop).toBe(0);
    });
  });

  describe('miscellaneous', function () {
    it('should display the number when the selected option is the number zero', function () {
      const rendered = render(<AutocompleteWithNumbers />, { wrapper: TestProviderWrapper });
      const input = rendered.container.querySelector('input');
      fireEvent.focus(input);
      const options = document.querySelectorAll('[data-sui="option"]');
      fireEvent.click(options[0]);
      expect(input).toHaveValue('0');
    });

    it('should pass data attributes to the panel element, not overlay', function () {
      const rendered = render(
        <SimpleAutocomplete
          data-is-autocomplete="auto"
        />,
        { wrapper: TestProviderWrapper },
      );

      const input = rendered.container.querySelector('input');
      fireEvent.focus(input);

      const panel = document.querySelector('[data-sui="autocomplete"]');
      const overlay = document.querySelector('[data-sui-tree="overlay:pane"]');

      expect(panel).toHaveAttribute('data-is-autocomplete', 'auto');
      expect(overlay).not.toHaveAttribute('data-is-autocomplete');
    });

    it('should not reopen a closed autocomplete when returning to a blurred tab', async function () {
      const rendered = render(<SimpleAutocomplete />, { wrapper: TestProviderWrapper });
      const overlayContainer = document.querySelector('[data-sui-overlay-root]');
      const input = rendered.container.querySelector('input');

      // Must trigger both kinds of focus events. fireEvent makes sure that the `onFocus` works,
      // and `input.focus` makes sure `document.activeElement` is set.
      fireEvent.focus(input);
      input.focus();
      expect(overlayContainer.children).toHaveLength(1);
      fireEvent.keyDown(input, { keyCode: ESCAPE });

      // Simulate the user going to a different tab
      fireEvent.blur(window);
      input.blur();

      // Simulate the user coming back
      fireEvent.focus(window);
      input.focus();

      expect(overlayContainer.children).toHaveLength(0);
    });

    it('should show the panel when the options are rendered asynchronously', function () {
      jest.useFakeTimers();
      const rendered = render(<AsyncAutocomplete />, { wrapper: TestProviderWrapper });
      const input = rendered.container.querySelector('input');
      fireEvent.focus(input);

      const panel = document.querySelector('[data-sui="autocomplete"]');
      expect(panel).toHaveAttribute('data-visibility', 'hidden');

      // Asynchronous state updates have to be wrapped in `act` or else the console will
      // print an error.
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(panel).toHaveAttribute('data-visibility', 'visible');
      jest.useRealTimers();
    });

    it('should call the `onSelect` callback when an option is selected', function () {
      const onSelectionSpy = jest.fn();
      const rendered = render(
        <AutocompleteWithSelectEvent onSelect={onSelectionSpy} />,
        { wrapper: TestProviderWrapper },
      );

      const input = rendered.container.querySelector('input');
      fireEvent.focus(input);
      const options = document.querySelectorAll('[data-sui="option"]');
      fireEvent.click(options[0]);

      expect(onSelectionSpy).toHaveBeenCalledTimes(1);
      expect(onSelectionSpy).toHaveBeenLastCalledWith(expect.objectContaining({
        value: expect.anything(),
        'data-list-key': expect.any(String),
        isUserInput: expect.any(Boolean),
        props: expect.any(Object),
        target: expect.any(window.HTMLElement),
      }));
    });

    it('should call the `onSelect` callback for new options', function () {
      const onSelectionSpy = jest.fn();
      const rendered = render(
        <AutocompleteWithSelectEvent onSelect={onSelectionSpy} />,
        { wrapper: TestProviderWrapper },
      );

      const input = rendered.container.querySelector('input');
      fireEvent.focus(input);
      const states = ['New York', 'Oregon', 'Washington', 'Puerto Rico'];
      rendered.rerender(
        <AutocompleteWithSelectEvent onSelect={onSelectionSpy} states={states} />,
      );

      const options = document.querySelectorAll('[data-sui="option"]');
      fireEvent.click(options[3]);
      expect(onSelectionSpy).toHaveBeenCalledTimes(1);
      expect(onSelectionSpy).toHaveBeenLastCalledWith(expect.objectContaining({
        value: 'Puerto Rico',
      }));
    });
  });
});

function SimpleAutocomplete(props) {
  const {
    autoActiveFirstOption, position, autocompleteDisabled, onOpen, onClose, autoComplete,
    readOnly, ...restProps
  } = props;
  const [value, setValue] = React.useState('');
  /**
   * @type {React.MutableRefObject<{ code: string, name: string }[]>}
   */
  const states = React.useRef([
    {code: 'AL', name: 'Alabama'},
    {code: 'CA', name: 'California'},
    {code: 'FL', name: 'Florida'},
    {code: 'KS', name: 'Kansas'},
    {code: 'MA', name: 'Massachusetts'},
    {code: 'NY', name: 'New York'},
    {code: 'OR', name: 'Oregon'},
    {code: 'PA', name: 'Pennsylvania'},
    {code: 'TN', name: 'Tennessee'},
    {code: 'VA', name: 'Virginia'},
    {code: 'WY', name: 'Wyoming'},
  ]);

  const filteredStates = React.useMemo(() => (
    value ?
      states.current.filter(state => state.name.match(new RegExp(value, 'gi'))) :
      states.current
  ), [value]);

  const displayFn = React.useCallback((state) => {
    return state ? state.name : state;
  }, []);

  const onChange = React.useCallback((event) => {
    setValue(event.target.value);
  }, [setValue]);

  return (
    <FormField>
      <Input
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        autoComplete={autoComplete}
        autocompleteDisabled={autocompleteDisabled}
        data-sui-autocomplete
      />
      <Autocomplete
        autoActiveFirstOption={autoActiveFirstOption}
        displayWith={displayFn}
        onOpen={onOpen}
        onClose={onClose}
        {...restProps}
      >
        { filteredStates.map(state => (
          <Option key={state.code} data-list-key={state.code} value={state}>
            <span>{ state.code }: { state.name }</span>
          </Option>
        )) }
      </Autocomplete>
    </FormField>
  )
}

function AutocompleteWithNumbers() {
  const numbers = React.useRef([0, 1, 2]);
  const [selectedNumber, setSelectedNumber] = React.useState('');

  const onChange = React.useCallback((event) => {
    setSelectedNumber(event.target.value);
  }, [setSelectedNumber]);

  return (
    <FormField>
      <Input
        value={selectedNumber}
        placeholder="Number"
        onChange={onChange}
        data-sui-autocomplete
      />
      <Autocomplete>
        { numbers.current.map(num => (
          <Option data-list-key={num} value={num} key={num}>
            <span>{ num }</span>
          </Option>
        ))}
      </Autocomplete>
    </FormField>
  )
}

function AsyncAutocomplete() {
  const [numbers, setNumbers] = React.useState([]);

  React.useEffect(() => {
    window.setTimeout(() => {
      setNumbers([1]);
    }, 1000);
  }, []);

  return (
    <FormField>
      <Input data-sui-autocomplete />
      <Autocomplete>
        { numbers.map(num => (
          <Option data-list-key={num} value={num} key={num}>
            <span>{ num }</span>
          </Option>
        ))}
      </Autocomplete>
    </FormField>
  );
}

function AutocompleteWithSelectEvent({ states, onSelect }) {
  const [selectedState, setSelectedState] = React.useState('');

  const onChange = React.useCallback((event) => {
    setSelectedState(event.target.value);
  }, [setSelectedState]);

  return (
    <FormField>
      <Input value={selectedState} onChange={onChange} data-sui-autocomplete />
      <Autocomplete onSelect={onSelect}>
        { states.map(state => (
          <Option data-list-key={state} value={state} key={state}>
            <span>{ state }</span>
          </Option>
        ))}
      </Autocomplete>
    </FormField>
  );
}

AutocompleteWithSelectEvent.defaultProps = {
  states: ['New York', 'Oregon', 'Puerto Rico'],
};

const filterByName = (namesArray, value) => {
  const filterValue = value.toLowerCase();
  return namesArray.filter(name => name.toLowerCase().indexOf(filterValue) === 0);
};

function AutocompleteWithGroups() {
  const [selectedState, setSelectedState] = React.useState('');
  const stateGroups = React.useRef([
    {
      title: 'One',
      states: ['Alabama', 'Alaska', 'Arizona', 'Arkansas']
    },
    {
      title: 'Two',
      states: ['Idaho', 'Illinois', 'Indiana', 'Iowa']
    },
    {
      title: 'Three',
      states: ['Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
    },
  ]);

  const filteredStates = React.useMemo(() => (
    selectedState ?
      stateGroups.current
        .map(group => ({ title: group.title, states: filterByName(group.states, selectedState) }))
        .filter(group => group.states.length > 0) :
      stateGroups.current
  ), [selectedState]);

  const onChange = React.useCallback((event) => {
    setSelectedState(event.target.value);
  }, [setSelectedState]);

  return (
    <FormField>
      <Input value={selectedState} onChange={onChange} data-sui-autocomplete />
      <Autocomplete>
        { filteredStates.map(group => (
          <OptGroup data-list-key={group.title} label={group.title} key={group.title}>
            { group.states.map(state => (
              <Option data-list-key={state} value={state} key={state}>
                <span>{ state }</span>
              </Option>
            )) }
          </OptGroup>
        )) }
      </Autocomplete>
    </FormField>
  );
}

AutocompleteWithSelectEvent.defaultProps = {
  states: ['New York', 'Oregon', 'Puerto Rico'],
};
