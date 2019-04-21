import styled, { css } from 'styled-components';
import _ from 'lodash';
import { GREY } from '../../../cdk/theme/colors';
import { getFontFamily, getLineHeight } from '../../core/theming/typographic-utils';
import { DEFAULT_TYPOGRAPHY_CONFIG } from '../../core/theming/typography';
import { DEFAULT_THEME_CONFIG, getColor } from '../../core/theming/colors';

const inactiveBorder = GREY[500];
const disabledBackground = GREY[100];
const disabledCheck = GREY[700];

export function themeThunk (components) {
  return function themeThunkFromScProps(props) {
    const colors = _.get(props, 'theme.colors', DEFAULT_THEME_CONFIG);

    // border colors
    const inactiveBackground = 'transparent';
    const activeBorder = colors.primary.default;
    const activeBackground = getColor(colors.primary, 0.8);
    const disabledBorder = inactiveBorder;
    // checkmark colors
    const defaultCheck = activeBorder;

    const { Frame, Checkmark, IndeterminatePath } = components;
    return css`
    ${Frame} {
      border-color: ${inactiveBorder};
      background-color: ${inactiveBackground};
    }
    
    &[data-focused=true] {
      ${Frame} { border-color: ${activeBorder}; }
    }
    
    ${Checkmark} {
      fill: none;
    }
    
    &[data-focus-origin=keyboard] ${Frame} { background-color: ${activeBackground}; }
    
    [data-shape=check-path] { stroke: ${defaultCheck} !important; }
    ${IndeterminatePath} { background-color: ${defaultCheck}; }
    
    &[data-disabled=true] {
      ${Frame} {
        border-color: ${disabledBorder};
        background-color: ${disabledBackground};
      }
      
      [data-shape=check-path] { stroke: ${disabledCheck} !important; }
      ${IndeterminatePath} { background-color: ${disabledCheck}; }
    }
    `;
  }
}

export function typographyThunk(components) {
  return function typographyThunkFromScProps(props) {
    const config = _.get(props, 'theme.typography', DEFAULT_TYPOGRAPHY_CONFIG);
    const { CheckboxLayout, CheckboxLabel } = components;
    return css`
    & {
      font-family: ${getFontFamily(config)};
    }
    
    ${CheckboxLayout} ${CheckboxLabel} {
      line-height: ${getLineHeight(config, 'body3')} 
    }
    `;
  }
}
