import { css } from 'styled-components';
import { GREY } from '../../../components/core/theme/colors';

const NORMAL = GREY[500];

export default css`
border-top-color: ${NORMAL};
&[aria-orientation=vertical] {
  border-right-color: ${NORMAL};
}`;
