import { css } from 'styled-components';
import { GREY, GREEN, RED } from '../../../cdk/theme/colors';
import { PLACEHOLDER } from '../../core/styles/vendor';

const active = GREEN[500];
const warn = RED[500];
const placeholderText = GREY[500];

export default css`
&:disabled {
  color: ${placeholderText};
}
caret-color: ${active};
${PLACEHOLDER(`
color: ${placeholderText};
`)}`;
