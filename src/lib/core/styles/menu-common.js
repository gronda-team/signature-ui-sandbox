import { css } from 'styled-components';

// menu width must be a multiple of 56px
export const OVERLAY_MIN_WIDTH = 112; // px 56 * 2
export const OVERLAY_MAX_WIDTH = 280; // px 56 * 5

export const MENU_ITEM_HEIGHT = 32; // px
export const MENU_SIDE_PADDING = 24; // px

export const MENU_BASE = elevation => css`
box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2),
  0px 8px 10px 1px rgba(0, 0, 0, 0.14),
  0px 3px 14px 2px rgba(0, 0, 0, 0.12);

min-width: ${OVERLAY_MIN_WIDTH}px;
max-width: ${OVERLAY_MAX_WIDTH}px;
overflow: auto;
-webkit-overflow-scrolling: touch;   // for momentum scroll on mobile
`;
