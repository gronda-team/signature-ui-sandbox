import { css } from 'styled-components';
import { GREY } from '../../../cdk/theme/colors';

const selectThemeThunk = (components) => {
  const { Content, Trigger, Value, ValueText, Panel, Placeholder } = components;
  return css`
  // We need to add margin to the top to reserve space in the layout for the label which sticks out
  // of the top. In order to ensure that the outline appearance aligns nicely with other form-field
  // appearances when center-aligned, we also need to add the same amount of margin to the bottom.
  ${Content} { background: white; }
  ${Value} { color: ${GREY[900]}; }
  ${Placeholder} { color: ${GREY[700]}; }
  &[aria-disabled=true] { color: ${GREY[500]}; }
  `;
};

export default selectThemeThunk;
