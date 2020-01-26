import styled, { css } from 'styled-components';
import { getColor } from '../core/theming/util';

function baseTheme(props) {
  const colors = props.theme.colors;

  const dynamicColorTheme = Object.keys(colors).reduce((acc, name) => {
    if (name === 'GREY') return acc;
    return acc + `
      &[data-color="${name.toLowerCase()}"] {
        caret-color: ${getColor(colors[name])};
      }
    `;
  }, '');

  return css`    
    &[data-color="primary"] {
      caret-color: ${getColor(colors.PRIMARY)};
    }
    
    &[data-color="accent"] {
      caret-color: ${getColor(colors.ACCENT)};
    }
    
    &[data-color="warn"] {
      caret-color: ${getColor(colors.WARN)};
    }
    
    ${dynamicColorTheme}
  `;
}

function baseTypography(props) {
  const lineHeight = 1.125;

  // The amount of space between the top of the line and the top of the actual text
  // (as a fraction of the font-size).
  const lineSpacing = (lineHeight - 1) / 2;

  return css`
    // input elements seem to have their height set slightly too large on Safari causing the text
    // to be misaligned w.r.t. the placeholder. Adding this margin corrects it.
    input& {
      margin-top: calc(${lineSpacing} * -1em);
    }
  `;
}

export const InputRoot = styled.input`
  // Font needs to be inherited, because by default input has a system font.
  font: inherit;

  // The Material input should match whatever background it is above.
  background: transparent;

  // If background matches current background then so should the color for proper contrast
  color: currentColor;

  // By default, input has a padding, border, outline and a default width.
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  width: 100%;

  // Prevent textareas from being resized outside the form field.
  max-width: 100%;

  // Needed to make last line of the textarea line up with the baseline.
  vertical-align: bottom;

  // User agent stylesheets set the text-align of inputs explicitly to "start". Those can be
  // easily overwritten by targeting the input element using a simple CSS selector, but since
  // the text-align will be applied most of the time on the \`mat-form-field\` to also align the
  // placeholder, the alignment should be inherited here.
  text-align: inherit;

  // Undo the red box-shadow glow added by Firefox on invalid inputs.
  // See https://developer.mozilla.org/en-US/docs/Web/CSS/:-moz-ui-invalid
  &:-moz-ui-invalid {
    box-shadow: none;
  }

  // Remove IE's default clear and reveal icons.
  &::-ms-clear,
  &::-ms-reveal {
    display: none;
  }

  // Clear Safari's decorations for search fields.
  &,
  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration,
  &::-webkit-search-results-button,
  &::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  // Also clear Safari's autofill icons. Note that this can't be in the
  // same selector as the IE ones, otherwise Safari will ignore it.
  &::-webkit-contacts-auto-fill-button,
  &::-webkit-caps-lock-indicator,
  &::-webkit-credentials-auto-fill-button {
    visibility: hidden;
  }

  // Fixes an issue on iOS where the following input types will collapse to 1px,
  // if they're empty, because we've overridden their background color.
  // See: https://stackoverflow.com/questions/18381594/input-type-date-appearance-in-safari-on-ios
  &[type="date"],
  &[type="datetime"],
  &[type="datetime-local"],
  &[type="month"],
  &[type="week"],
  &[type="time"] {
    &::after {
      content: ' ';
      white-space: pre;
      width: 1px;
    }
  }

  // Reduce the size of the native buttons in a date/time input,
  // because they can increase the height of the input (see #13317).
  &::-webkit-inner-spin-button,
  &::-webkit-calendar-picker-indicator,
  &::-webkit-clear-button {
    font-size: 0.75em;
  }
  
  &::placeholder {
    // Prevent users from being able to select the placeholder text. Most of the time this can't
    // happen, however it's possible to do it when clicking on a disabled input (see #13479).
    user-select: none;
    
    &:-ms-input-placeholder {
      // fix IE11 not able to focus programmatically with css style -ms-user-select: none
      // see https://github.com/angular/components/issues/15093
      -ms-user-select: text;
    }
  }
  
  // Note that we can't use something like visibility: hidden or
  // display: none, because IE ends up preventing the user from
  // focusing the input altogether.
  [data-hide-placeholder="true"] &::placeholder {
    // Needs to be !important, because the placeholder will end up inheriting the
    // input color in IE, if the consumer overrides it with a higher specificity.
    color: transparent !important;
    
    // Overwrite browser specific CSS properties that can overwrite the "color" property.
    // Some developers seem to use this approach to easily overwrite the placeholder and
    // label color. See: https://github.com/angular/components/issues/12074
    -webkit-text-fill-color: transparent;
    
    // Remove the transition to prevent the placeholder
    // from overlapping when the label comes back down.
    transition: none;
  }
  
  textarea& {
    // Only allow resizing along the Y axis.
    resize: vertical;
    overflow: auto;
    
    &[data-autosize="true"] {
      resize: none;
    }
    
    // This class is temporarily applied to the textarea when it is being measured. It is immediately
    // removed when measuring is complete. We use \`!important\` rules here to make sure user-specified
    // rules do not interfere with the measurement.
    &[data-autosize-measuring="true"] {
      height: auto !important;
      overflow: hidden !important;
      // Having 2px top and bottom padding seems to fix a bug where Chrome gets an incorrect
      // measurement. We just have to account for it later and subtract it off the final result.
      padding: 2px 0 !important;
      box-sizing: content-box !important;
    }
    
    // The 2px padding prevents scrollbars from appearing on Chrome even when they aren't needed.
    // We also add a negative margin to negate the effect of the padding on the layout.
    padding: 2px 0;
    margin: -2px 0;
  }
  
  select& {
    appearance: none;
    position: relative;
    background-color: transparent;
    display: inline-flex;
    box-sizing: border-box;
    padding-top: 1em;
    top: -1em;
    margin-bottom: -1em;

    &::-ms-expand {
      display: none;
    }

    // The \`outline: none\` from \`.mat-input-element\` works on all browsers, however Firefox also
    // adds a special \`focus-inner\` which we have to disable explicitly. See:
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Firefox
    &::-moz-focus-inner {
      border: 0;
    }
  
    &:not(:disabled) {
      cursor: pointer;
    }

    // As a part of its user agent styling, IE11 has a blue box inside each focused
    // \`select\` element which we have to reset. Note that this needs to be in its own
    // selector, because having it together with another one will cause other browsers
    // to ignore it.
    &::-ms-value {
      // We need to reset the \`color\` as well, because IE sets it to white.
      color: inherit;
      background: none;
    }
  }
  
  ${baseTheme}
  ${baseTypography}
`;
