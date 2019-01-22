import { css } from 'styled-components';

const VISUALLY_HIDDEN = css`
border: 0;
clip: rect(0 0 0 0);
height: 1px;
margin: -1px;
overflow: hidden;
padding: 0;
position: absolute;
width: 1px;

// Avoid browsers rendering the focus ring in some cases.
outline: 0;

// Avoid some cases where the browser will still render the native controls (see #9049).
-webkit-appearance: none;
-moz-appearance: none;
`;

export default VISUALLY_HIDDEN;
