import { css } from 'styled-components';

/**
 * Visually hide
 */
export const DISPLAY_NONE_STYLE = { display: 'none' };

/**
 * Span to fill nearest ancestor with defined positioning
 */
export const fill = css`
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
`;
