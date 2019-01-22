import styled, { css } from 'styled-components';
import dividerTheme from './theme';
const DIVIDER_WIDTH = 1; // px
const DIVIDER_INSET_MARGIN = 80; // px

// This mixin provides the correct offset for an inset divider based on the
// size of the parent class (e.g. avatar vs icon)
export const insetDividerOffsetMixin = (offset, padding) => {
  const dividerOffset = (2 * padding) + offset; // px
  return css`
  margin-left: ${dividerOffset}px;
  width: calc(100% - ${dividerOffset}px);
  
  [dir=rtl] & {
    margin-left: auto;
    margin-right: ${dividerOffset}px;
  }`;
};

export default styled.div`
display: block;
margin: 0;
border-top: solid ${DIVIDER_WIDTH}px;

&[aria-orientation=vertical] {
  border-top: 0;
  border-right: solid 1px;
}

&[data-inset=true] {
  margin-left: ${DIVIDER_INSET_MARGIN}px;
  [dir=rtl] & {
    margin-left: auto;
    margin-right: ${DIVIDER_INSET_MARGIN}px;
  }
}

${dividerTheme}
`;
