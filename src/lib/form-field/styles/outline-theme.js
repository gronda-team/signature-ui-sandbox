import { css } from 'styled-components';
import { GREEN, GREY, RED } from '../../../cdk/theme/colors';
import {formFieldLabelPositioning} from './theme-base';

const ACTIVE_BORDER = GREEN[500];
const UNFILLED_BORDER = GREY[300];
const DEFAULT_BORDER = GREY[500];
const INVALID_BORDER = RED[500];
const DISABLED_BACKGROUND = GREY[100];

export const outlineThemeThunk = (components) => {
  const { FormFieldBar } = components;
  return css`
  ${FormFieldBar} {
    border-color: ${UNFILLED_BORDER};
  }
  
  // Lowest priority of enabled states
  &[data-value=filled] {
    ${FormFieldBar} {
      border-color: ${DEFAULT_BORDER};
    }
  }
  
  &[data-focused=true] {
    ${FormFieldBar} {
      border-color: ${ACTIVE_BORDER};
    }
  }
  
  // Highest priority of enabled states
  &[data-invalid=true] {
    ${FormFieldBar} {
      border-color: ${INVALID_BORDER};
    }
  }
  
  &[data-disabled=true] {
    ${FormFieldBar} {
      border-color: ${UNFILLED_BORDER};
      background-color: ${DISABLED_BACKGROUND};
    }
  }
  `;
};

export const outlineTypographyThunk = (components) => {
  const {
    FormFieldWrapper,
    FormFieldInfix,
    FormFieldLabelWrapper,
    FormFieldLabel,
  } = components;

  const LINE_HEIGHT = 1.125; // em
  // The amount to scale the label.
  const LABEL_FONT_SCALE = 1; // unitless
  // Padding for the infix
  const INFIX_PADDING = 0.5; // em
  // The margin applied to the form-field-infix to reserve space for the floating label.
  const INFIX_MARGIN_TOP = (LINE_HEIGHT * LABEL_FONT_SCALE) + 0.25; // em

  return css`
  ${FormFieldWrapper} {
    margin-bottom: ${INFIX_MARGIN_TOP}em;
  }
  
  ${FormFieldInfix} {
    padding: 0;
    border-top: 0;
    margin: ${INFIX_PADDING}em 0;
  }
  
  ${FormFieldLabelWrapper} {
    top: ${-INFIX_MARGIN_TOP}em;
    padding-top: ${INFIX_MARGIN_TOP}em;
  }
  
  ${FormFieldLabel} {
    top: ${INFIX_MARGIN_TOP + INFIX_PADDING}em;
    ${formFieldLabelPositioning(LABEL_FONT_SCALE, INFIX_PADDING, INFIX_MARGIN_TOP)}
  }
  `;
};
