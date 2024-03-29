import styled, { keyframes, css } from 'styled-components';
import {ButtonRoot} from '../../button/styles';
import dialogThemeThunk from './theme';

const DIALOG_PADDING = 24; // px
const DIALOG_BORDER_RADIUS = 3; // px
const DIALOG_MAX_HEIGHT = 65; // vh
const DIALOG_BUTTON_MARGIN = 8; // px

/** The dialog content itself */
export const DialogContent = styled.div`
display: block;
margin: 0 ${-DIALOG_PADDING}px;
padding: 0 ${DIALOG_PADDING}px;
max-height: ${DIALOG_MAX_HEIGHT}vh;
overflow: auto;
-webkit-overflow-scrolling: touch;
`;

/** The dialog title */
export const DialogTitle = styled.div`
margin: 0 0 20px;
display: block;
`;

/** The action buttons at the very bottom of the dialog */
export const DialogActions = styled.div`
padding: 8px 0;
display: flex;
flex-wrap: wrap;
min-height: 52px;
align-items: center;

// Pull the actions down to avoid their padding stacking with the dialog's padding.
margin-bottom: -${DIALOG_PADDING}px;

&[align=end] {
  justify-content: flex-end;
}

&[align=center] {
  justify-content: center;
}

${ButtonRoot} + ${ButtonRoot} {
  margin-left: ${DIALOG_BUTTON_MARGIN}px;

  [dir=rtl] & {
    margin-left: 0;
    margin-right: ${DIALOG_BUTTON_MARGIN}px;
  }
}
`;

/**
 * Since there is no broad support for
 * onTransitionStart, we must fake it by
 * using animations. Here, we can use the
 * animation name as a proxy for if we're
 * going between entering or exiting.
 */

export const animationEnter = keyframes`/*!*/`;
export const animationExit = keyframes`/*!!*/`;

export const ANIMATION_ENTER = css`${animationEnter}`;
export const ANIMATION_EXIT = css`${animationExit}`;

const dialogTheme = dialogThemeThunk({
  DialogTitle,
});

export const DialogContainerRoot = styled.div`
display: block;
padding: ${DIALOG_PADDING}px;
border-radius: ${DIALOG_BORDER_RADIUS}px;
box-sizing: border-box;
overflow: auto;
outline: 0;

// The dialog container should completely fill its parent overlay element.
width: 100%;
height: 100%;

// Since the dialog won't stretch to fit the parent, if the height
// isn't set, we have to inherit the min and max values explicitly.
min-height: inherit;
max-height: inherit;
transition-property: opacity, transform;
&[data-state=null], &[data-state=exit] {
  animation-name: ${ANIMATION_EXIT};
  transform: scale(0.86);
  transition-duration: 75ms;
  transition-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
}

&[data-state=enter] {
  animation-name: ${ANIMATION_ENTER};
  transform: none;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}

${dialogTheme}
`;
