import { css } from 'styled-components';
import { GREEN, GREY, RED } from '../../../cdk/theme/colors';
import {formFieldLabelPositioning} from './theme-base';

/**
 * Colors TBD
 */

export const fillThemeThunk = (components) => {
  const { FormFieldBar, FormFieldLabel } = components;
  return css`
  ${FormFieldBar} {
    background-color: rgba(0, 0, 0, 0.04);
  }
  
  &[data-disabled=true] {
    ${FormFieldBar} {
      background-color: rgba(0, 0, 0, 0.02);
    }
    
    ${FormFieldLabel} {
      color: rgba(0, 0, 0, 0.17);
    }
  }
  `;
};

export const fillTypographyThunk = (components) => {
  const { FormFieldInfix, FormFieldLabel } = components;

  const LINE_HEIGHT = 1.125; // em
  // The amount to scale the font for the floating label and subscript.
  const SUBSCRIPT_FONT_SCALE = 0.75;
  // The padding on top of the infix.
  const INFIX_PADDING_TOP = 0.25; // em
  // The padding below the infix.
  const INFIX_PADDING_BOTTOM = 0.75; // em
  // The margin applied to the form-field-infix to reserve space for the floating label.
  const INFIX_MARGIN_TOP = LINE_HEIGHT * SUBSCRIPT_FONT_SCALE; // em
  // Font size to use for the for the prefix and suffix icons.
  const FILL_LABEL_OFFSET = -0.5; // em

  return css`
  ${FormFieldInfix} {
    padding: ${INFIX_PADDING_TOP}em 0 ${INFIX_PADDING_BOTTOM}em;
  }
  
  ${FormFieldLabel} {
    top: ${INFIX_MARGIN_TOP + INFIX_PADDING_TOP}em;
    margin-top: ${FILL_LABEL_OFFSET}em;
    ${formFieldLabelPositioning(
      SUBSCRIPT_FONT_SCALE, INFIX_PADDING_TOP + FILL_LABEL_OFFSET, INFIX_MARGIN_TOP,
    )}
  }
  `;
};
