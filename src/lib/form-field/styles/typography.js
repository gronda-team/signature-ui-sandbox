import { css } from 'styled-components';

const LINE_HEIGHT = 0.5; // em
// The amount to scale the font for the floating label and subscript.
const SUBSCRIPT_FONT_SCALE = 0.75;
// The amount to scale the font for the prefix and suffix icons.
const PREFIX_SUFFIX_ICON_FONT_SCALE = 1.5;

// The padding on the infix. Mocks show half of the text size.
const INFIX_PADDING = 0.5; // em
// The margin applied to the form-field-infix to reserve space for the floating label.
const INFIX_MARGIN_TOP = LINE_HEIGHT * SUBSCRIPT_FONT_SCALE; // px
// Font size to use for the label and subscript text.
const SUBSCRIPT_FONT_SIZE = SUBSCRIPT_FONT_SCALE * 100; // %
// Font size to use for the for the prefix and suffix icons.
const PREFIX_SUFFIX_ICON_FONT_SIZE = PREFIX_SUFFIX_ICON_FONT_SCALE * 100; // %
// The space between the bottom of the .mat-form-field-flex area and the subscript wrapper.
// Mocks show half of the text size, but this margin is applied to an element with the subscript
// text font size, so we need to divide by the scale factor to make it half of the original text
// size.
const SUBSCRIPT_MARGIN_TOP = 0.5 / SUBSCRIPT_FONT_SCALE; // em
// The padding applied to the form-field-wrapper to reserve space for the subscript, since it's
// absolutely positioned. This is a combination of the subscript's margin and line-height, but we
// need to multiply by the subscript font scale factor since the wrapper has a larger font size.
const WRAPPER_PADDING_BOTTOM = (SUBSCRIPT_MARGIN_TOP + LINE_HEIGHT) * SUBSCRIPT_FONT_SCALE;

export default (components) => {
  const {
    FieldFlex,
    FieldLabel,
    FieldLabelWrapper,
    FieldInfix,
    FieldSubscriptWrapper,
    FieldWrapper,
  } = components;
  return css`
  ${FieldWrapper} { padding-bottom: ${WRAPPER_PADDING_BOTTOM}em; }
  ${FieldFlex} {
    padding: ${INFIX_PADDING}em 0;
    // Throws off the baseline if we do it as a real margin, so we do it as a border instead.
    border-top: ${INFIX_MARGIN_TOP}em solid transparent;
  }
  
  ${FieldLabelWrapper} {
    top: -${INFIX_MARGIN_TOP}em;
    padding: ${INFIX_MARGIN_TOP}em 0;
  }
  
  ${FieldLabel} {
    top: ${INFIX_MARGIN_TOP + INFIX_PADDING}em;
  }
  
  ${FieldSubscriptWrapper} {
    font-size: ${SUBSCRIPT_FONT_SIZE}%;
    margin-top: ${SUBSCRIPT_MARGIN_TOP}em;

    // We want the subscript to start at the end of the content box, not the padding box,
    // so we move it up by the padding amount (adjusted for the smaller font size);
    top: calc(100% - ${WRAPPER_PADDING_BOTTOM / SUBSCRIPT_FONT_SCALE}em);
  }
  `;
}
