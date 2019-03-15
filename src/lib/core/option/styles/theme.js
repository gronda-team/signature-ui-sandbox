import { css } from 'styled-components';
import { GREY, CYAN } from '../../../../cdk/theme/colors';
import { getFontFamily, getFontSize } from '../../../text';

export const optionThemeThunk = () => {
  return css`
  color: ${GREY[900]};
  &:hover:not([aria-disabled=true]),
  &:focus:not([aria-disabled=true]),
  &[data-active=true]:not([aria-disabled=true]) {
    background: ${CYAN[100]};
  }
  
  &[aria-disabled=true] { color: ${GREY[500]}; }
  `;
};

export const optionTypographyThunk = config => css`
font-family: ${getFontFamily(config)};
font-size: ${getFontSize(config, 'body2')};
`;
