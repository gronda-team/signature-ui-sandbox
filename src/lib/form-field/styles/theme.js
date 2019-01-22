import { css } from 'styled-components';

const outlineThemeThunk = (components) => {
  const { FieldFlex, FieldLabelWrapper } = components;
  return css`
  // We need to add margin to the top to reserve space in the layout for the label which sticks out
  // of the top. In order to ensure that the outline appearance aligns nicely with other form-field
  // appearances when center-aligned, we also need to add the same amount of margin to the bottom.
  ${FieldFlex} {
    border: solid 1px;
    border-radius: 3px;
    min-height: 32px;
  }
  
  ${FieldLabelWrapper} { bottom: 75%; }
  `;
};

export default outlineThemeThunk;
