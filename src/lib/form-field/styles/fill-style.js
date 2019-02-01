import { css } from 'styled-components';

// The border radius for the form field fill box.
const FILL_BORDER_RADIUS = 3; // px
// The horizontal padding between the edge of the form field fill box
// and the start of the text.
const FILL_SIDE_PADDING = 0.75; // em
/*
The vertical padding between the edge of the form field
fill box and the start of the text as well as between
the floating label and the value.
 */
const FILL_LINE_SPACING = 0.75; // em
// The scale of the subscript and floating label text w.r.t the value text.
const FILL_SUBSCRIPT_FONT_SCALE = 0.75; // unitless
/*
Horizontal padding between the edge of the subscript
box and the start of the subscript text
 */
const FILL_SUBSCRIPT_PADDING = FILL_SIDE_PADDING / FILL_SUBSCRIPT_FONT_SCALE; // em

const fillAppearanceThunk = (components) => {
  const {
    FormFieldFlex,
    FormFieldSubscriptWrapper,
  } = components;
  return css`
  ${FormFieldFlex} {
    border-radius: ${FILL_BORDER_RADIUS}px;
    padding: ${FILL_LINE_SPACING}em ${FILL_SIDE_PADDING}em 0;
  }
  
  ${FormFieldSubscriptWrapper} {
    padding: 0 ${FILL_SUBSCRIPT_PADDING}em;
  }
  `;
};

export default fillAppearanceThunk;
