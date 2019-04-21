import { css } from 'styled-components';
import _ from 'lodash';
import { GREY } from '../../../cdk/theme/colors';
import { getFontFamily, getFontSize, getFontWeight } from '../../core/theming/typographic-utils';
import { DEFAULT_THEME_CONFIG } from '../../core/theming/colors';
import { DEFAULT_TYPOGRAPHY_CONFIG } from '../../core/theming/typography';

// border colors
const inactiveBackground = 'transparent';
const activeForeground = 'white';

const disabledBorder = GREY[700];
const disabledBackground = 'transparent';

export function themeThunk(components) {
  return function themeThunkFromScProps(props) {
    const { Close } = components;
    const colors = _.get(props, 'theme.colors', DEFAULT_THEME_CONFIG);
    const border = colors.primary.default;
    const inactiveForeground = border;
    const activeBackground = border;
    const disabledForeground = disabledBorder;

    return css`
    border-color: ${border};
    background-color: ${inactiveBackground};
    color: ${inactiveForeground};
    
    &::after {
      background-color: ${border};
    }
    
    &:not([aria-disabled=true]) {    
      ${Close} {
        stroke: ${border};
        &:hover {
          opacity: 0.54;
        }
      }
    }
    
    &[aria-disabled=true] {
      border-color: ${disabledBorder};
      background-color: ${disabledBackground};
      color: ${disabledForeground};
      stroke: ${disabledForeground};
    }
    
    &[aria-selected=true][aria-disabled=false] {
      background-color: ${activeBackground};
      color: ${activeForeground};
    }
    `;
  }
}

export function tagTypography(components) {
  return function tagTypographyFromScProps(props) {
    const { Close } = components;
    const config = _.get(props, 'theme.typography', DEFAULT_TYPOGRAPHY_CONFIG);
    return css`
    font-family: ${getFontFamily(config)};
    font-weight: ${getFontWeight(config, 'body2')};
    font-size: ${getFontSize(config, 'body2')};
    
    ${Close} {
      font-size: 18px;
    }
    `;
  }
}
