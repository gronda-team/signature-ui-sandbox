import { css } from 'styled-components';

// This mixin ensures an element spans to fill the nearest ancestor with defined positioning.
const FILL = css`
top: 0;
left: 0;
right: 0;
bottom: 0;
position: absolute;
`;

export default FILL;
