import { css } from 'styled-components';
import _ from 'lodash';
import { GREY } from '../../../cdk/theme/colors';
import { PLACEHOLDER } from '../../core/styles/vendor';
import { getLineHeight } from '../../text';
import { DEFAULT_THEME_CONFIG } from '../../core/theming/colors';
import { DEFAULT_TYPOGRAPHY_CONFIG } from '../../core/theming/typography';

const placeholderText = GREY[500];

/**
 * These thunks don't require components, but to keep them standardized, we keep the functional
 * declaration rather than exposing `themeThunkFromScProps` plainly.
 */
export function themeThunk() {
  return function themeThunkFromScProps(props) {
    const colors = _.get(props, 'theme.colors', DEFAULT_THEME_CONFIG);
    const active = colors.primary.default;
    return css`
    &:disabled {
      color: ${placeholderText};
    }
    caret-color: ${active};
    ${PLACEHOLDER(`
    color: ${placeholderText};
    `)}`;
  }
}

export function typographyThunk() {
  return function typographyThunkFromScProps(props) {
    const config = _.get(props, 'theme.typography', DEFAULT_TYPOGRAPHY_CONFIG);
    const lineHeight = Number.parseFloat(getLineHeight(config, 'input'));
    const lineSpacing = (lineHeight - 1) / 2;
    return css`
    margin-top: ${-lineSpacing}em;
    `;
  }
}
