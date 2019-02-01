import { css } from 'styled-components';

const OUTLINE_BORDER_RADIUS = 3; // px

const outlineAppearanceThunk = (components) => {
  const {
    FormFieldBar,
  } = components;
  return css`
  ${FormFieldBar} {
    border: solid 1px;
    border-radius: ${OUTLINE_BORDER_RADIUS}px;
    padding: 0 0.5em;
  }
  
  &[data-has-open-panel=true][data-field-type=autocomplete] {
    ${FormFieldBar} {
      border-radius: ${OUTLINE_BORDER_RADIUS}px ${OUTLINE_BORDER_RADIUS}px 0 0;
    }
  }
  `;
};

export default outlineAppearanceThunk;
