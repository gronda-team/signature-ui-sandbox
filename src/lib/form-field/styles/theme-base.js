import { css } from 'styled-components';
import { GREY, GREEN, RED } from '../../../cdk/theme/colors';
import {SelectArrowWrapper} from '../../select/styles';

const DEFAULT_TEXT = GREY[900];
const PRIMARY = GREEN[500];
const WARN = RED[500];
const REQUIRED_LABEL_COLOR = WARN;

// Required mixin theming for all appearances
export const formFieldBaseThemeMixin = (components) => {
  const {
    FormFieldLabel,
    FormFieldHint,
    FormFieldRequiredMarker,
  } = components;
  return css`
  ${FormFieldLabel} {
    color: ${DEFAULT_TEXT};
  }
  
  ${FormFieldHint} {
    color: ${DEFAULT_TEXT};
  }
  
  &[data-focused=true] {
    ${FormFieldRequiredMarker} {
      color: ${REQUIRED_LABEL_COLOR};
    }
  }
  
  &[data-autofilled=true] {
    ${FormFieldLabel} {
      color: ${PRIMARY};
    }
  }
  
  &[data-field-type=select][data-focused=true] {
    ${SelectArrowWrapper} > svg {
      stroke: ${PRIMARY};
    }
  } 
  `;
};

/**
 * Form field label mixin
 * @param fontScale Unitless number for font scale
 * @param infixPadding Unitless padding (converted to em in mixin)
 * @param infixMarginTop Unitless margin (converted to em in mixin)
 */
export const formFieldLabelPositioning = (fontScale, infixPadding, infixMarginTop) => css`
transform: translateY(${-infixMarginTop - infixPadding}em) scale(${fontScale});
width: calc(100% / ${fontScale});
`;

/**
 * Typographic styles
 */
const LINE_HEIGHT = 1.125; // em
// The amount to scale the font for the floating label and subscript.
const SUBSCRIPT_FONT_SCALE = 0.75;
// The amount to scale the font for the prefix and suffix icons.
const PREFIX_SUFFIX_ICON_FONT_SCALE = 1.5;

// The padding on the infix. Mocks show half of the text size.
const INFIX_PADDING = 0.5; // em
// The margin applied to the form-field-infix to reserve space for the floating label.
const INFIX_MARGIN_TOP = LINE_HEIGHT * SUBSCRIPT_FONT_SCALE; // em
// Font size to use for the label and subscript text.
const SUBSCRIPT_FONT_SIZE = SUBSCRIPT_FONT_SCALE * 100; // %
// Font size to use for the for the prefix and suffix icons.
const PREFIX_SUFFIX_ICON_FONT_SIZE = PREFIX_SUFFIX_ICON_FONT_SCALE * 100; // %
// The space between the bottom of the .mat-form-field-flex area and the subscript wrapper.
// Mocks show half of the text size, but this margin is applied to an element with the subscript
// text font size, so we need to divide by the scale factor to make it half of the original text
// size.
const SUBSCRIPT_MARGIN_TOP = 0.5 / SUBSCRIPT_FONT_SCALE; // em
// The padding applied to the form-field-wrapper to reserve space for the subscript, since it's
// absolutely positioned. This is a combination of the subscript's margin and line-height, but we
// need to multiply by the subscript font scale factor since the wrapper has a larger font size.
const WRAPPER_PADDING_BOTTOM = (SUBSCRIPT_MARGIN_TOP + LINE_HEIGHT) * SUBSCRIPT_FONT_SCALE; // em

export const typographyThunk = (components) => {
  const {
    FormFieldLabel,
    FormFieldLabelWrapper,
    FormFieldPrefix,
    FormFieldSuffix,
    FormFieldInfix,
    FormFieldSubscriptWrapper,
    FormFieldWrapper,
  } = components;
  return css`
  & {
    font-size: inherit;
    line-height: ${LINE_HEIGHT}em;
    font-weight: 400;
  }
  
  ${FormFieldWrapper} { padding-bottom: ${WRAPPER_PADDING_BOTTOM}em; }
  
  ${FormFieldPrefix}, ${FormFieldSuffix} {
    i {
      font-size: ${PREFIX_SUFFIX_ICON_FONT_SCALE};
      line-height: ${LINE_HEIGHT}em;
    }
  }
  
  ${FormFieldInfix} {
    padding: ${INFIX_PADDING}em 0;
    // Throws off the baseline if we do it as a real margin, so we do it as a border instead.
    border-top: ${INFIX_MARGIN_TOP}em solid transparent;
  }
  
  ${FormFieldLabelWrapper} {
    top: -${INFIX_MARGIN_TOP}em;
    padding-top: ${INFIX_MARGIN_TOP}em;
  }
  
  ${FormFieldLabel} {
    top: ${INFIX_MARGIN_TOP + INFIX_PADDING}em;
    ${formFieldLabelPositioning(SUBSCRIPT_FONT_SCALE, INFIX_PADDING, INFIX_MARGIN_TOP)}
  }
  
  ${FormFieldSubscriptWrapper} {
    font-size: ${SUBSCRIPT_FONT_SIZE}%;
    margin-top: ${SUBSCRIPT_MARGIN_TOP}em;
    /*
    Subscript starts at end of the content box,
    not the padding box, so we move it up by
    the padding amount
     */
    top: calc(100% - ${WRAPPER_PADDING_BOTTOM / SUBSCRIPT_FONT_SCALE}em);
  }
  `;
};
