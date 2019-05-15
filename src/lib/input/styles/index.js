import styled, { css } from 'styled-components';
import { themeThunk, typographyThunk } from './theme';
import { EASE_OUT } from '../../core/styles/animation';
import { PLACEHOLDER } from '../../core/styles/vendor';
import {TEXT_FIELD_AUTOFILL_MONITOR} from '../../../cdk/text-area/styles';
import { SELECT_ARROW_SIZE, SelectArrowWrapper, SelectArrow } from '../../select/styles';
import { nativeSelectThemeThunk } from '../../form-field/styles/theme-base';
import { getLineHeight } from '../../core/theming/typographic-utils';

const baseInput = css`
// Font needs to be inherited, because by default <input> has a system font.
font: inherit;

// The Material input should match whatever background it is above.
background: transparent;

// If background matches current background then so should the color for proper contrast
color: currentColor;

// By default, <input> has a padding, border, outline and a default width.
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
&[type='date'],
&[type='datetime'],
&[type='datetime-local'],
&[type='month'],
&[type='week'],
&[type='time'] {
  &::after {
    content: ' ';
    white-space: pre;
    width: 1px;
  }
}

${PLACEHOLDER(`
  // Delay the transition until the label has animated about a third of the way through, in
  // order to prevent the placeholder from overlapping for a split second.
  transition: color ${EASE_OUT.DURATION} ${EASE_OUT.DURATION / 3} ${EASE_OUT.CURVE};
`)}

[data-noop-placeholder=true] & {
  ${PLACEHOLDER(`
    // Needs to be !important, because the placeholder will end up inheriting the
    // input color in IE, if the consumer overrides it with a higher specificity.
    color: transparent !important;

    // Overwrite browser specific CSS properties that can overwrite the \`color\` property.
    // Some developers seem to use this approach to easily overwrite the placeholder and
    // label color. See: https://github.com/angular/material2/issues/12074
    -webkit-text-fill-color: transparent;

    // Remove the transition to prevent the placeholder
    // from overlapping when the label comes back down.
    transition: none;
  `)}
}

${TEXT_FIELD_AUTOFILL_MONITOR}
`;

/**
 * Base styling for native select elements. Must replace default arrow with Signature UI chevron.
 */
const baseSelect = css`
  ${baseInput}
  -moz-appearance: none;
  -webkit-appearance: none;
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
`;

export const BaseInput = styled.input`
${baseInput}
${themeThunk()}
${typographyThunk()}
`;

export const BaseSelect = styled.select`
${baseSelect}
${themeThunk()}
${typographyThunk()}

[data-field-type=native-select] &, [data-field-type=native-select-multiple] & {
  padding-right: ${SELECT_ARROW_SIZE * 3}px;
  text-overflow: ellipsis;
  
  [dir=rtl] & {
    padding-right: 0;
    padding-left: ${SELECT_ARROW_SIZE * 3}px;
  }
}
`;

/**
 * Styles for the SUI arrow
 */

export const NativeSelectArrow = styled(SelectArrow)`
`;

export const NativeSelectArrowWrapper = styled(SelectArrowWrapper)`
  display: inline-block;
  white-space: nowrap;
  flex: 0 0 auto;
  position: absolute;
  bottom: 1px;
  right: 0;
  line-height: ${props => getLineHeight(props.theme.TYPOGRAPHY, 'input')};
  pointer-events: none;

  ${NativeSelectArrow} {
    height: 10px;
    width: 16px;
  }
  
  ${nativeSelectThemeThunk({ Arrow: NativeSelectArrow })}
`;

export const BaseTextArea = styled.textarea`
${baseInput}
// Prevents IE from always adding a scrollbar by default.
// Only allow resizing along the Y axis.
resize: vertical;
overflow: auto;

&[data-autosize=true] {
  resize: none;
}
// The 2px padding prevents scrollbars from appearing on Chrome even when they aren't needed.
// We also add a negative margin to negate the effect of the padding on the layout.
padding: 2px 0;
margin: -2px 0;
${themeThunk()}
`;
