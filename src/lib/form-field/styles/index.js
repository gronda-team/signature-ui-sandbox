import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { TRUNCATE } from '../../core/styles/common';
import { EASE_OUT } from '../../core/styles/animation';
import outlineAppearanceThunk from './outline-style';
import { outlineThemeThunk, outlineTypographyThunk } from './outline-theme';
import fillAppearanceThunk from './fill-style';
import { fillThemeThunk, fillTypographyThunk} from './fill-theme';
import {SELECT_PLACEHOLDER_ARROW_SPACE} from '../../select/styles';
import {formFieldBaseThemeMixin, typographyThunk } from './theme-base';
import { TYPOGRAPHY_DEFAULTS } from '../../text';

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

// Common styles between FormFieldFlex and FormFieldBar
const flexUsableMixin = css`
box-sizing: border-box;
align-items: baseline;
width: 100%;
`;

// We use a flex layout to baseline align the prefix and suffix elements.
// The underline is outside of it so it can cover all of the elements under this flex container.
export const FormFieldFlex = styled.div`
${flexUsableMixin}
display: block;
`;

// Bar for handling appropriate spacing with labels + absolute positioning
export const FormFieldBar = styled.div`
${flexUsableMixin}
display: inline-flex;
`;

// prefix and suffix
const FormFieldFix = styled.div`
white-space: nowrap;
flex: none;
position: relative;
`;

export const FormFieldPrefix = FormFieldFix.withComponent('div');
FormFieldPrefix.defaultProps = { '__sui-internal-type': 'Prefix' };
export const FormFieldSuffix = FormFieldFix.withComponent('div');
FormFieldSuffix.defaultProps = { '__sui-internal-type': 'Suffix' };

export const FormFieldInfix = styled.div`
display: block;
position: relative;
flex: auto;
min-width: 0;
width: ${DEFAULT_INFIX_WIDTH}px;
`;

// Controls icon styling in subscript wrapper and label wrapper
const subscriptLabelIconMixin = css`
i {
  width: 1em;
  height: 1em;
  font-size: inherit;
  vertical-align: baseline;
}
`;

// Used to hide the label overflow on IE, since IE doesn't take transform into account when
// determining overflow.
export const FormFieldLabelWrapper = styled.span`
position: absolute;
left: 0;
box-sizing: content-box;
width: 100%;
overflow: hidden;
pointer-events: none;  // We shouldn't catch mouse events (let them through).

[dir=rtl] & {
  left: auto;
  right: 0;
}
${subscriptLabelIconMixin}
`;

// The label itself
export const FormFieldLabel = styled.label`
position: absolute;
left: 0;
font: inherit;
cursor: pointer;
pointer-events: auto;
display: flex; // to ensure that the div doesn't push the star onto next line

// Put ellipsis text overflow.
width: 100%;
${TRUNCATE}

& * { ${TRUNCATE} }

transform-origin: 0 0;
transition: transform ${EASE_OUT.DURATION} ${EASE_OUT.CURVE},
            color ${EASE_OUT.DURATION} ${EASE_OUT.CURVE},
            width ${EASE_OUT.DURATION} ${EASE_OUT.CURVE};

[dir=rtl] & {
  left: auto;
  right: 0;
}

[data-disabled=true] & {
  cursor: default;
}
`;

export const FormFieldRequiredMarker = styled.span`
`;

export const FormFieldSubscriptWrapper = styled.div`
position: absolute;
box-sizing: border-box;
width: 100%;
overflow: hidden; // prevents multi-line errors from overlapping the control
${subscriptLabelIconMixin}
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
export const FormFieldHintSpacer = styled.div`
flex: 1 0 ${HINT_MIN_SPACE}em;
`;

// Single error message displayed beneath the form field underline.
export const Error = styled.div`display: block;`;

/*
Root component, composed with the custom styles
 */
const components = {
  FormFieldBar,
  FormFieldPrefix,
  FormFieldSuffix,
  FormFieldInfix,
  FormFieldLabel,
  FormFieldLabelWrapper,
  FormFieldSubscriptWrapper,
  FormFieldRequiredMarker,
  FormFieldWrapper,
};
// outline theme
const outlineStyle = outlineAppearanceThunk(components);
const outlineTheme = outlineThemeThunk(components);
const outlineTypography = outlineTypographyThunk(components, TYPOGRAPHY_DEFAULTS);
// fill theme
const fillStyle = fillAppearanceThunk(components);
const fillTheme = fillThemeThunk(components);
const fillTypography = fillTypographyThunk(components, TYPOGRAPHY_DEFAULTS);

export const FormFieldRoot = styled.div`
display: inline-block;
position: relative;

// Avoid problems with text-align
text-align: left;
[dir=rtl] & { text-align: right; }

&[data-field-type=select] {
  &[data-disabled=false] ${FormFieldFlex} {
    cursor: pointer;
  }
  
  ${FormFieldLabel} {
    width: calc(100% - ${SELECT_PLACEHOLDER_ARROW_SPACE}px);
  }
}

${formFieldBaseThemeMixin(components)}
${typographyThunk(components, TYPOGRAPHY_DEFAULTS)}

&[data-appearance=outline] {${outlineStyle} ${outlineTheme} ${outlineTypography} }
&[data-appearance=fill] { ${fillStyle} ${fillTheme} ${fillTypography} }
`;
