import { css } from 'styled-components';

export default function themeThunk() {
  return function themeThunkFromScProps() {
    return css`
      & {
        background-color: white;
      }
    `;
  }
}
