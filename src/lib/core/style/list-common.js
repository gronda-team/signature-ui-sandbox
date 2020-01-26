import { css } from 'styled-components';

// This mixin will ensure that lines that overflow the container will hide the overflow and
// truncate neatly with an ellipsis.
export const truncateLine = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
