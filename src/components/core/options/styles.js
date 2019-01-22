import styled, { css } from 'styled-components';
import { TRUNCATE_LINE } from '../theme/text';

const ITEM_HEIGHT = 32; // px;
export const PANEL_X_PADDING = 12; // px

export const baseItemStyle = css`
${TRUNCATE_LINE}
// Needs to be a block for the ellipsis to work.
display: block;
line-height: ${ITEM_HEIGHT}px;
height: ${ITEM_HEIGHT}px;
padding: 0 ${PANEL_X_PADDING}px;
text-align: left;
text-decoration: none;   // necessary to reset anchor tags
max-width: 100%;
&[aria-disabled="true"] { cursor: default; }
&[dir="rtl"] { text-align: right; }
`;