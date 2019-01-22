import { css } from 'styled-components';
import { GREY, CYAN } from '../../../../components/core/theme/colors';

const optionThemeThunk = () => {
  return css`
  color: ${GREY[900]};
  &:hover:not([aria-disabled=true]),
  &:focus:not([aria-disabled=true]) {
    background: ${CYAN[100]};
  }
  
  &[aria-disabled=true] { color: ${GREY[500]}; }
  `;
};

export default optionThemeThunk;
