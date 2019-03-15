import { css } from 'styled-components';
import { GREY, GREEN, RED } from '../../../cdk/theme/colors';
import { PLACEHOLDER } from '../../core/styles/vendor';
import { getLineHeight } from '../../text';

const active = GREEN[500];
const warn = RED[500];
const placeholderText = GREY[500];

export const themeThunk = () => css`
&:disabled {
  color: ${placeholderText};
}
caret-color: ${active};
${PLACEHOLDER(`
color: ${placeholderText};
`)}`;

export const typographyThunk = (config) => {
  const lineHeight = Number.parseFloat(getLineHeight(config, 'input'));
  const lineSpacing = (lineHeight - 1) / 2;
  return css`
  margin-top: ${-lineSpacing}em;
  `;
};
