import styled from 'styled-components';
import { FormField } from '../../../../lib/form-field';

export const Fieldset = styled.fieldset`
display: block;
margin: 20px 0;
padding: 0;
border: none;
&:first-of-type { margin-top: 0; }
&:last-of-type { margin-bottom: 0; }
`;

export const Legend = styled.legend`
margin-bottom: 8px;
padding: 0;
font-weight: bold;
`;

export const InlineFormField = styled.div`
display: inline-block;
margin: 0 4px;
&:first-of-type { margin-left: 0; }
&:last-of-type { margin-right: 0; }
`;
