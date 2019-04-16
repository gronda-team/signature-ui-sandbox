import styled from 'styled-components';
import {buttonBaseThunk, fullThunk, iconThunk, strokedButtonThunk} from './button-base';
import FILL from '../../core/styles/layout-common';
import { EASE_IN_OUT } from '../../core/styles/animation';
import themeThunk from './theme';

const BUTTON_FOCUS_TRANSITION = `opacity 200MS ${EASE_IN_OUT.CURVE}, background-color 200ms ${EASE_IN_OUT.CURVE}`;

export const ButtonWrapper = styled.span``;
export const ButtonFocusOverlay = styled.div`
${FILL}

// Disable pointer events for the ripple container and focus overlay because the container
// will overlay the user content and we don't want to disable mouse events on the user content.
// Pointer events can be safely disabled because the ripple trigger element is the host element.
pointer-events: none;

// Inherit the border radius from the parent so that focus overlay and ripples don't exceed the
// parent button boundaries. Note that an inherited border radius does not work properly if
// the actual button element does have a border because it causes the inner content to be
// smaller. We have special logic for stroked buttons to handle this scenario.
border-radius: inherit;
opacity: 0;
transition: ${BUTTON_FOCUS_TRANSITION};
`;

/**
 * To be shown if the button is disabled. Note that we can't just change
 * the color of the background in ButtonFocusOverlay because going between
 * disabled/new color would flicker the background color while the opacity
 * is being changed as well. (It would look weird going from not disabled
 * to disabled).
 */
export const ButtonDisabledOverlay = styled(ButtonFocusOverlay)``;

const components = {
  FocusOverlay: ButtonFocusOverlay,
  DisabledOverlay: ButtonDisabledOverlay,
  Wrapper: ButtonWrapper,
};

export const ButtonRoot = styled.div`
&[data-appearance=standard] {
  ${ButtonFocusOverlay} { opacity: 0; }
}

// Elements inside of all type of buttons should be vertical aligned in the middle.
${ButtonFocusOverlay} > * {
  vertical-align: middle;
}

${ButtonDisabledOverlay} {
  opacity: 0.3;
}

&:not([disabled]) {
  ${ButtonDisabledOverlay} {
    opacity: 0;
  }
}

// Only flat and stroked buttons (not raised, FABs or icon buttons) have a hover style.
// Use the same visual treatment for hover as for focus.
&[data-appearance=standard], &[data-appearance=stroked], &[data-appearance=fill][data-color=secondary] {
  &:hover {
    ${ButtonFocusOverlay} { opacity: 0.04; }
  }
}

// Disable the hover styles on non-hover devices. Since this is more of a progressive
// enhancement and not all desktop browsers support this kind of media query, we can't
// use something like @media (hover).
@media (hover: none) {
  &[data-appearance=standard], &[data-appearance=stroked], &[data-appearance=fill][data-color=secondary] {
    &:hover {
      ${ButtonFocusOverlay} { opacity: 0; }
    }
  }
}

${buttonBaseThunk(components)}

&[data-appearance=stroked] { ${strokedButtonThunk(components)} }
&[data-size=icon] { ${iconThunk(components)} }
&[data-size=full] { ${fullThunk()} }

${themeThunk(components)}
`;
