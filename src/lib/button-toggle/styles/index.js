import styled, { css } from 'styled-components';
import { USER_SELECT } from '../../core/styles/vendor';
import FILL from '../../core/styles/layout-common';
import themeThunk from './theme';

const BUTTON_TOGGLE_PADDING = 24; //
const BUTTON_TOGGLE_HEIGHT = 32;
const BUTTON_TOGGLE_BORDER_RADIUS = 3;

const standaloneWrapper = css`
position: relative;
display: inline-flex;
flex-direction: row;
white-space: nowrap;
overflow: hidden;
border-radius: ${BUTTON_TOGGLE_BORDER_RADIUS}px;
-webkit-tap-highlight-color: transparent;
`;

export const ButtonToggleLabelContent = styled.div`
${USER_SELECT('none')}
display: inline-block;
line-height: ${BUTTON_TOGGLE_HEIGHT}px;
padding: 0 ${BUTTON_TOGGLE_PADDING}px;

// Prevents IE from shifting the content on click.
position: relative;

& > * { vertical-align: middle; }
`;

export const ButtonToggleFocusOverlay = styled.div`
border-radius: inherit;
// Disable pointer events to prevent it from hijacking user events.
pointer-events: none;
opacity: 0;
${FILL}
`;

export const ButtonToggleButton = styled.button`
border: 0;
background: none;
color: inherit;
padding: 0;
margin: 0;
font: inherit;
outline: none;
width: 100%; // Stretch the button in case the consumer set a custom width.
cursor: pointer;
[data-disabled=true] & {
  cursor: default;
}
// Remove the extra focus outline that is added by Firefox on native buttons.
&::-moz-focus-inner {
  border: 0;
}
`;

export const ButtonToggleRoot = styled.div`
white-space: nowrap;
position: relative;

&[data-focus-origin=keyboard] {
  ${ButtonToggleFocusOverlay} {
    opacity: 1;
  }
}

&[data-standalone=true] { ${standaloneWrapper} }

&:not([data-disabled=true]):hover ${ButtonToggleFocusOverlay} {
  opacity: 0.04;
}

// Similar to components like the checkbox, slide-toggle and radio, we cannot show the focus
// overlay for ".cdk-program-focused" because mouse clicks on the label element would be always
// treated as programmatic focus. Note that it needs the extra ":not" in order to have more
// specificity than the ":hover" above.
&[data-focused=true]:not([data-disabled=true]) ${ButtonToggleFocusOverlay} {
  opacity: 0.12;
}

// On touch devices the hover state will linger on the element after the user has tapped.
// Disable it, because it can be confused with focus. We target the :hover state explicitly,
// because we still want to preserve the keyboard focus state for hybrid devices that have
// a keyboard and a touchscreen.
@media (hover: none) {
  &:not([data-disabled=true]):hover ${ButtonToggleFocusOverlay} { display: none; }
}
`;

const components = {
  ButtonToggle: ButtonToggleRoot,
  FocusOverlay: ButtonToggleFocusOverlay,
};

export const ButtonToggleGroupRoot = styled.div`
&[data-vertical=true] {
  flex-direction: column;
  & ${ButtonToggleLabelContent} {
    // Vertical button toggles shouldn't be an inline-block, because the toggles should
    // fill the available width in the group.
    display: block;
  }
}
${standaloneWrapper}
${themeThunk(components)}
`;
