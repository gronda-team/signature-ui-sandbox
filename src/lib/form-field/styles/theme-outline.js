import { css } from 'styled-components';
import { GREEN, GREY, RED } from '../../../cdk/theme/colors';

const idleEmptyOutline = GREY[500];
const disabledOutline = idleEmptyOutline;
const idleFilledOutline = GREY[700];
const disabledBackground = GREY[100];
const activeOutline = GREEN[500];
const errorOutline = RED[500];
const requiredMarker = errorOutline;

const outlineThemeThunk = (components) => {
  const { FieldRequiredMarker, FieldFlex } = components;
  return css`
  &[data-focus=focused] {
    ${FieldRequiredMarker} { color: ${requiredMarker}; }
    ${FieldFlex} { border-color: ${activeOutline}; }
  }
  
  &[data-focus=idle][data-disabled=false] {
    &[data-value=filled] {
      ${FieldFlex} { border-color: ${idleFilledOutline}; }
    }
    &[data-value=empty] {
      ${FieldFlex} { border-color: ${idleEmptyOutline}; }
    }
  }
  
  &[data-disabled=true] {
    ${FieldFlex} {
      background-color: ${disabledBackground};
      border-color: ${disabledOutline};
    }
  }
  `;
};

export default outlineThemeThunk;
