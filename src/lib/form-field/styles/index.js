import styled from 'styled-components';
import PropTypes from 'prop-types';
import { TRUNCATE } from '../../core/styles/common';
import { EASE_OUT } from '../../core/styles/animation';
import outlineAppearanceThunk from './appearance-outline';
import outlineThemeThunk from './theme-outline';
import fillAppearanceThunk from './appearance-fill';
import fillThemeThunk from './theme-fill';
import typography from './typography';

// Min amount of space between start and end hint.
const HINT_MIN_SPACE = 1; // em
// Infix stretches to fit the container, but naturally wants to be this wide. We set this in order
// to have a a consistent natural size for the various types of controls that can go in a form
// field.
const DEFAULT_INFIX_WIDTH = 180; // px

// Global wrapper. We need to apply margin to the element for spacing, but
// cannot apply it to the host element directly.
export const FormFieldWrapper = styled.div`
position: relative;
`;

// We use a flex layout to baseline align the prefix and suffix elements.
// The underline is outside of it so it can cover all of the elements under this flex container.
export const FormFieldFlex = styled.div`
display: inline-flex;
align-items: baseline;
box-sizing: border-box;
width: 100%;
`;

// prefix and suffix
export const FormFieldFix = styled.div`
white-space: nowrap;
flex: none;
position: relative;
`;

export const FormFieldInfix = styled.div`
display: block;
position: relative;
flex: auto;
min-width: 0;
width: ${DEFAULT_INFIX_WIDTH}px;
`;

// Used to hide the label overflow on IE, since IE doesn't take transform into account when
// determining overflow.
export const FormFieldLabelWrapper = styled.span`
box-sizing: content-box;
width: 100%;
overflow: hidden;
pointer-events: none;  // We shouldn't catch mouse events (let them through).
`;


// The label itself. This is invisible unless it is. The logic to show it is
// basically `empty || (float && (!empty || focused))`. Float is dependent on the
// `floatingPlaceholder` property.
// The label is after the form field control, but needs to be aligned top-left of the infix <div>.
export const FormFieldLabel = styled.label`
font: inherit;
pointer-events: none;  // We shouldn't catch mouse events (let them through).

// Put ellipsis text overflow.
width: 100%;
${TRUNCATE}

transform-origin: 0 0;
transition: transform ${EASE_OUT.DURATION} ${EASE_OUT.CURVE},
            color ${EASE_OUT.DURATION} ${EASE_OUT.CURVE},
            width ${EASE_OUT.DURATION} ${EASE_OUT.CURVE};

// Hide the label initially, and only show it when it's floating or the control is empty.
display: none;

[dir=rtl] & {
  transform-origin: 100% 0;
  left: auto;
  right: 0;
}

[data-value-status=filled] & { transition: none; }
`;

export const FormFieldRequiredMarker = styled.span.attrs({
  'aria-hidden': true,
})`
`;

export const FormFieldUnderline = styled.span`
position: absolute;
width: 100%;
// Need this so that the underline doesn't block the hover effect.
pointer-events: none;
// We transform the height slightly higher to fix inconsistent underline height for some DPIs.
// Without this we observed that at zoom levels between 50% and 100% some form-field underlines
// would disappear. The issue appears to be related to fractional pixels since (e.g. underlines
// with their top at x.6 would disappear, but ones with there top at x.7 were fine). The exact
// fractions that caused problems seemed to depend on the screen resolution and zoom level. We
// experimentally discovered that adding a very slight scale factor fixes the issue.
transform: scaleY(1.0001);
`;

export const FormFieldSubscriptWrapper = styled.div`
position: absolute;
box-sizing: border-box;
width: 100%;
overflow: hidden; // prevents multi-line errors from overlapping the control
`;

// Clears the floats on the hints. This is necessary for the hint animation to work.
export const FormFieldHintWrapper = styled.div`display: flex;`;

// the actual hint
export const FormFieldHint = styled.div`
text-align: ${props => props.align === 'start' ? 'left' : 'right'};
`;

FormFieldHint.propTypes = { align: PropTypes.oneOf(['start', 'end']) };
FormFieldHint.defaultProps = { align: 'start' };

// Spacer used to make sure start and end hints have enough space between them.
export const FormFieldHintSpacer = styled.div.attrs({
  'aria-hidden': true,
})`
flex: 1 0 ${HINT_MIN_SPACE}em;
`;

// Single error message displayed beneath the form field underline.
export const Error = styled.div`display: block;`;

/*
Root component, composed with the custom styles
 */
const components = {
  FieldFix: FormFieldFix,
  FieldFlex: FormFieldFlex,
  FieldLabel: FormFieldLabel,
  FieldInfix: FormFieldInfix,
  FieldLabelWrapper: FormFieldLabelWrapper,
  FieldSubscriptWrapper: FormFieldSubscriptWrapper,
  FieldRequiredMarker: FormFieldRequiredMarker,
  FieldWrapper: FormFieldWrapper,
};
// outline theme
const outlineStyle = outlineAppearanceThunk(components);
const outlineTheme = outlineThemeThunk(components);
// fill theme
const fillStyle = fillAppearanceThunk(components);
const fillTheme = fillThemeThunk(components);

export const FormFieldRoot = styled.div`
display: inline-block;
position: relative;
text-align: left;
[dir=rtl] & { text-align: right; }
&[data-appearance=outline] { ${outlineTheme} ${outlineStyle} }
&[data-appearance=fill] { ${fillStyle} ${fillTheme} }
${typography(components)}
`;
