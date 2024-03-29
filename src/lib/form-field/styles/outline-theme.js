import { css } from 'styled-components';
import _ from 'lodash';
import { GREY } from '../../../cdk/theme/colors';
import {formFieldLabelPositioning} from './theme-base';
import { getLineHeight } from '../../core/theming/typographic-utils';
import { DEFAULT_THEME_CONFIG } from '../../core/theming/colors';
import { DEFAULT_TYPOGRAPHY_CONFIG } from '../../core/theming/typography';

const UNFILLED_BORDER = GREY[300];
const DEFAULT_BORDER = GREY[500];
const DISABLED_BACKGROUND = GREY[100];

export function outlineThemeThunk(components) {
  return function outlineThemeThunkFromScProps(props) {
    const { FormFieldBar } = components;
    const colors = _.get(props, 'theme.COLORS', DEFAULT_THEME_CONFIG);
    const INVALID_BORDER = colors.warn.default;
    const ACTIVE_BORDER = colors.primary.default;

    return css`
    ${FormFieldBar} {
      border-color: ${UNFILLED_BORDER};
    }
    
    &[data-field-type=native-select][data-value=empty] select {
      color: ${DEFAULT_BORDER};
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
  }
}

export function outlineTypographyThunk(components) {
  return function outlineTypographyThunkFromScProps(props) {
    const {
      FormFieldWrapper,
      FormFieldInfix,
      FormFieldLabelWrapper,
      FormFieldLabel,
    } = components;
    const config = _.get(props, 'theme.TYPOGRAPHY', DEFAULT_TYPOGRAPHY_CONFIG);

    const LINE_HEIGHT = Number.parseFloat(getLineHeight(config, 'input')); // em
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
  }
}
