import styled from 'styled-components';
import {ButtonRoot} from '../../button/styles';

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

&[data-state=null], &[data-state=exit] {
  opacity: 0;
  transform: scale(0.7);
  transition: opacity 75ms cubic-bezier(0.4, 0.0, 0.2, 1),
    transform 75ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

&[data-state=enter] {
  transform: none;
  transition: opacity 150ms cubic-bezier(0, 0, 0.2, 1),
    transform 150ms cubic-bezier(0, 0, 0.2, 1);
}
`;
