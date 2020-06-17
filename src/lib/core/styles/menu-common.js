import { css } from 'styled-components';
import { TRUNCATE } from './common';

// menu width must be a multiple of 56px
export const OVERLAY_MIN_WIDTH = 112; // px 56 * 2
export const OVERLAY_MAX_WIDTH = 280; // px 56 * 5
export const OVERLAY_MAX_HEIGHT = 180;

export const MENU_ITEM_HEIGHT = 48; // px
export const MENU_SIDE_PADDING = 24; // px
export const MENU_ICON_MARGIN = 24; // px

export const MENU_BASE = elevation => css`
box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2),
  0px 8px 10px 1px rgba(0, 0, 0, 0.14),
  0px 3px 14px 2px rgba(0, 0, 0, 0.12);

min-width: ${OVERLAY_MIN_WIDTH}px;
max-width: ${OVERLAY_MAX_WIDTH}px;
overflow: auto;
-webkit-overflow-scrolling: touch;   // for momentum scroll on mobile
`;

export const MENU_ITEM_BASE = css`
${TRUNCATE}
// Needs to be a block for the ellipsis to work.
display: block;
line-height: ${MENU_ITEM_HEIGHT}px;
height: ${MENU_ITEM_HEIGHT}px;
padding: 0 ${MENU_SIDE_PADDING}px;

text-align: left;
text-decoration: none;   // necessary to reset anchor tags

// Required for Edge not to show scrollbars when setting the width manually. See #12112.
max-width: 100%;

&[disabled] {
  cursor: default;
}

[dir=rtl] & {
  text-align: right;
}

i {
  margin-right: ${MENU_ICON_MARGIN}px;
  vertical-align: middle;

  svg {
    vertical-align: top;
  }

  [dir='rtl'] & {
    margin-left: ${MENU_ICON_MARGIN}px;
    margin-right: 0;
  }
}
`;
