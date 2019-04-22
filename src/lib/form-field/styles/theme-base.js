import { css } from 'styled-components';
import _ from 'lodash';
import { GREY } from '../../../cdk/theme/colors';
import {SelectArrowWrapper} from '../../select/styles';
import { getLineHeight } from '../../core/theming/typographic-utils';
import { convertLevelToStyles } from '../../core/theming/typographic-utils';
import { DEFAULT_THEME_CONFIG } from '../../core/theming/colors';
import { DEFAULT_TYPOGRAPHY_CONFIG } from '../../core/theming/typography';

const DEFAULT_TEXT = GREY[900];
const ARROW_STROKE = GREY[700];

// Required mixin theming for all appearances
export function formFieldBaseThemeMixin(components) {
  return function formFieldBaseThemeFromScProps(props) {
    const colors = _.get(props, 'theme.COLORS', DEFAULT_THEME_CONFIG);
    const PRIMARY = colors.primary.default;
    const REQUIRED_LABEL_COLOR = colors.warn.default;

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
  }
}

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

export function typographyThunk(components) {
  return function typographyThunkFromScProps(props) {
    const {
      FormFieldLabel,
      FormFieldLabelWrapper,
      FormFieldPrefix,
      FormFieldSuffix,
      FormFieldInfix,
      FormFieldSubscriptWrapper,
      FormFieldWrapper,
    } = components;

    const config = _.get(props, 'theme.TYPOGRAPHY', DEFAULT_TYPOGRAPHY_CONFIG);
    /**
     * Typographic styles
     */
    const LINE_HEIGHT = Number.parseFloat(getLineHeight(config, 'input')); // em
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
    return css`
    & {
      ${convertLevelToStyles(config, 'input')}
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
  }
}

/** Themes for the native select (arrow mostly) */
export const nativeSelectThemeThunk = (components) => {
  const { Arrow } = components;
  return css`
  ${Arrow} {
    fill: none;
    stroke: ${ARROW_STROKE};
  }
  `;
};
