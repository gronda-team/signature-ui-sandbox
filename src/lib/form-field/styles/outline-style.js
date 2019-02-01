import styled, { css } from 'styled-components';

const OUTLINE_SIDE_PADDING = 0.75; // em
const OUTLINE_SUBSCRIPT_FONT_SCALE = 0.75; // scale
const OUTLINE_LABEL_OVERLAP = 0.25; // em
const OUTLINE_BORDER_RADIUS = 3; // px
const OUTLINE_WIDTH = 1; // px
const OUTLINE_SUBSCRIPT_PADDING = 1; // em

const outlineAppearanceThunk = (components) => {
  const {
    FieldFlex,
    FieldLabel,
    FieldLabelWrapper,
    FieldSubscriptWrapper,
    FieldWrapper,
  } = components;
  return css`
  & {
    margin-bottom: ${OUTLINE_SIDE_PADDING}em;
  }
  // We need to add margin to the top to reserve space in the layout for the label which sticks out
  // of the top. In order to ensure that the outline appearance aligns nicely with other form-field
  // appearances when center-aligned, we also need to add the same amount of margin to the bottom.
  ${FieldWrapper} {
    margin: ${OUTLINE_LABEL_OVERLAP}em 0;
  }
  
  ${FieldFlex} {
    padding: 0 ${OUTLINE_SIDE_PADDING}em;
    margin-top: -${OUTLINE_LABEL_OVERLAP}em;
    position: relative;
    border: solid ${OUTLINE_WIDTH}px;
    border-radius: ${OUTLINE_BORDER_RADIUS}px;
    min-height: 32px;
    line-height: 32px;
  }
  
  ${FieldLabelWrapper} { display: block; positio }
  ${FieldLabel} {
    display: block;
    pointer-events: auto;
    cursor: pointer;
  }
  
  &[data-disabled=true] {
    ${FieldLabel} {
      cursor: auto;
    }
  }
  `;
};

export default outlineAppearanceThunk;
