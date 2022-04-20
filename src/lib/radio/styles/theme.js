import { css } from 'styled-components';
import _ from 'lodash';
import { GREY } from '../../../cdk/theme/colors';
import { getColor, DEFAULT_THEME_CONFIG } from '../../core/theming/colors';
import { DEFAULT_TYPOGRAPHY_CONFIG } from '../../core/theming/typography';
import { getFontFamily } from '../../core/theming/typographic-utils';

// border colors
const BORDER = GREY[500];


const DISABLED_FOREGROUND = GREY[700];
const DISABLED_BACKGROUND = GREY[100];

export function themeThunk(components) {
  return function themeThunkFromScProps(props) {
    const { OuterCircle, InnerCircle } = components;
    const colors = _.get(props, 'theme.COLORS', DEFAULT_THEME_CONFIG);
    const ACTIVE = colors.primary.default;
    const ACTIVE_BACKGROUND = getColor(colors.primary, 0.8); // used for CDK focus

    return css`
    ${OuterCircle} {
      border-color: ${BORDER};
    }
    
    &[data-disabled=true] ${OuterCircle} { background-color: ${DISABLED_BACKGROUND}; }
    
    &[data-checked=true] {
      &[data-disabled=false] ${InnerCircle} { background-color: ${ACTIVE}; }
      &[data-disabled=true] ${InnerCircle} { background-color: ${DISABLED_FOREGROUND}; }
    }
    
    &[data-focused=true][data-focus-origin=keyboard] {
      ${OuterCircle} {
        border-color: ${ACTIVE};
        background-color: ${ACTIVE_BACKGROUND};
      }
    }
    `;
  }
}

export function typographyThunk() {
  return function typographyThunkFromScProps(props) {
    const config = _.get(props, 'theme.TYPOGRAPHY', DEFAULT_TYPOGRAPHY_CONFIG);
    return css`
      & {
        font-family: ${getFontFamily(config)};
      }
    `;
  }
}
