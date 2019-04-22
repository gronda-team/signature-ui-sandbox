import { css } from 'styled-components';
import _ from 'lodash';
import { GREY } from '../../../../cdk/theme/colors';
import { getFontFamily, getFontSize } from '../../theming/typographic-utils';
import { DEFAULT_THEME_CONFIG, getColor } from '../../theming/colors';
import { DEFAULT_TYPOGRAPHY_CONFIG } from '../../theming/typography';

export function optionThemeThunk() {
  return function optionThemeThunkFromScProps(props) {
    const colors = _.get(props, 'theme.COLORS', DEFAULT_THEME_CONFIG);
    const background = getColor(colors.primary, 0.76);
    return css`
    color: ${GREY[900]};
    &:hover:not([aria-disabled=true]),
    &:focus:not([aria-disabled=true]),
    &[data-active=true]:not([aria-disabled=true]) {
      background: ${background};
    }
    
    &[aria-disabled=true] { color: ${GREY[500]}; }
    `;
  }
}

export function optionTypographyThunk() {
  return function optionTypographyThunkFromScProps(props) {
    const config = _.get(props, 'theme.TYPOGRAPHY', DEFAULT_TYPOGRAPHY_CONFIG);
    return css`
    font-family: ${getFontFamily(config)};
    font-size: ${getFontSize(config, 'body2')};
    `;
  }
}
