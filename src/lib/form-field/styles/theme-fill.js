import { css } from 'styled-components';
import { GREEN, GREY, RED } from '../../../components/core/theme/colors';

const idleFilledOutline = GREY[500];
const idleFilledBackground = GREY[300];
const idleEmptyOutline = idleFilledBackground;
const idleEmptyBackground = GREY[100];
const disabledOutline = idleEmptyOutline;
const disabledBackground = GREY[100];
const activeOutline = GREEN[300];
const activeBackground = GREEN[100];
const errorOutline = RED[500];
const requiredMarker = errorOutline;

const fillThemeThunk = (components) => {
  const { FieldRequiredMarker, FieldFlex } = components;
  return css`
  &[data-focus=focused] {
    ${FieldRequiredMarker} { color: ${requiredMarker}; }
    ${FieldFlex} {
      border-color: ${activeOutline};
      background-color: ${activeBackground};
    }
  }
  
  &[data-focus=idle][data-disabled=false] {
    &[data-value=filled] {
      ${FieldFlex} {
        border-color: ${idleFilledOutline};
        background-color: ${idleFilledBackground};
      }
    }
    &[data-value=empty] {
      ${FieldFlex} {
        border-color: ${idleEmptyOutline};
        background-color: ${idleEmptyBackground};
      }
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

export default fillThemeThunk;
