import { css } from 'styled-components';
import { GREY } from '../../../cdk/theme/colors';

const dialogThemeThunk = (components) => {
  const {
    DialogTitle,
  } = components;

  return css`
  & {
    background: white;
    color: ${GREY[900]};
  }
  
  ${DialogTitle} {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
  }
  `;
};

export default dialogThemeThunk;
