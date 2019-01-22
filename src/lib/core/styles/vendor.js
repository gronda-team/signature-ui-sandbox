import { css } from 'styled-components';

export const PLACEHOLDER = content => css`
&::placeholder { ${content}; }
&::-moz-placeholder { ${content}; }
&::-webkit-input-placeholder { ${content}; }
&:-ms-input-placeholder { ${content}; }
`;

export const USER_SELECT = value => css`
-webkit-user-select: ${value};
-moz-user-select: ${value};
-ms-user-select: ${value};
user-select: ${value};
`;
