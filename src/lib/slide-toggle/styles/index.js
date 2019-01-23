import styled from 'styled-components';
import VISUALLY_HIDDEN from '../../core/styles/a11y';
import { TOGGLE_PADDING } from '../../core/styles/variables';
import { USER_SELECT } from '../../core/styles/vendor';
import { TRUNCATE_LINE } from '../../../cdk/theme/text';
import { LINEAR } from '../../core/styles/animation';
import themeThunk from './theme';

const SLIDE_TOGGLE_THUMB_SIZE = 14; // px
const SLIDE_TOGGLE_BAR_BORDER_RADIUS = 3; // px
const SLIDE_TOGGLE_HEIGHT = 24; // px
const SLIDE_TOGGLE_SPACING = TOGGLE_PADDING; // px
const SLIDE_TOGGLE_BAR_WIDTH = 36; // px
const SLIDE_TOGGLE_BAR_HEIGHT = 18; // px
const SLIDE_TOGGLE_BAR_TRACK_WIDTH = SLIDE_TOGGLE_BAR_WIDTH - SLIDE_TOGGLE_THUMB_SIZE; // px
const SLIDE_TOGGLE_BAR_VERTICAL_PADDING = (SLIDE_TOGGLE_THUMB_SIZE - SLIDE_TOGGLE_BAR_HEIGHT) / 2; // px

// The label element is our root container for the slide-toggle / switch indicator and label text.
// It has to be a label, to support accessibility for the visual hidden input.
export const SlideToggleLabel = styled.label`
display: flex;
flex: 1;
flex-direction: row;
align-items: center;
height: inherit;
cursor: pointer;
`;

// Horizontal bar for the slide-toggle.
// The slide-toggle bar is shown behind the movable thumb element.
export const SlideToggleBar = styled.div`
position: relative;

width: ${SLIDE_TOGGLE_BAR_WIDTH}px;
height: ${SLIDE_TOGGLE_BAR_HEIGHT}px;

border: solid 1px;

// Prevent shrinking of the bar container. It can happen that the content is long enough to
// shrink the bar and the thumb.
flex-shrink: 0;

border-radius: ${SLIDE_TOGGLE_BAR_BORDER_RADIUS}px;
`;

// The slide toggle shows a visually hidden input inside of the component, which is used
// to take advantage of the native browser functionality.
const INPUT_HORIZONTAL_OFFSET = SLIDE_TOGGLE_THUMB_SIZE / 2; // px
// Move the input to the bottom and in the middle of the thumb.
// Visual improvement to properly show browser popups when being required.
export const SlideToggleInput = styled.input`
${VISUALLY_HIDDEN}
bottom: 0;
left: ${INPUT_HORIZONTAL_OFFSET}px;
`;

// The thumb container is responsible for the dragging functionality.
// The container includes the visual thumb and the ripple container element.
export const SlideToggleThumbContainer = styled.div`
position: absolute;
z-index: 1;
width: ${SLIDE_TOGGLE_THUMB_SIZE}px;
height: ${SLIDE_TOGGLE_THUMB_SIZE}px;
top: ${-SLIDE_TOGGLE_BAR_VERTICAL_PADDING}px;
left: ${-SLIDE_TOGGLE_BAR_VERTICAL_PADDING}px;
transform: translate3d(0, 0, 0);
transition: ${LINEAR.CURVE} ${LINEAR.DURATION};
transition-property: transform;
cursor: grab;

// Once the thumb container is being dragged around, we remove the transition duration to
// make the drag feeling fast and not delayed.
[data-dragging=true] & {
  cursor: grabbing;
  transition-duration: 0ms;
}
`;

// The visual thumb element that moves inside of the thumb bar.
// The parent thumb-container container is responsible for the movement of the visual thumb.
export const SlideToggleThumb = styled.div`
height: ${SLIDE_TOGGLE_THUMB_SIZE}px;
width: ${SLIDE_TOGGLE_THUMB_SIZE}px;
border-radius: ${SLIDE_TOGGLE_BAR_BORDER_RADIUS}px;
`;

export const SlideToggleContent = styled.span`
${TRUNCATE_LINE}
`;

const components = {
  Bar: SlideToggleBar,
  Thumb: SlideToggleThumb,
  Label: SlideToggleLabel,
  ThumbContainer: SlideToggleThumbContainer,
};

export const SlideToggleRoot = styled.div`
display: inline-block;
height: ${SLIDE_TOGGLE_HEIGHT}px;
max-width: 100%;
line-height: ${SLIDE_TOGGLE_HEIGHT}px;
white-space: nowrap;
outline: none;
// Disable user selection to ensure that dragging is smooth without grabbing
// some elements accidentally.
${USER_SELECT('none')}
-webkit-tap-highlight-color: transparent;

&[data-checked=true] {
  ${SlideToggleThumbContainer} {
    transform: translate3d(${SLIDE_TOGGLE_BAR_TRACK_WIDTH}px, 0, 0);
  
    [dir=rtl] & {
      transform: translate3d(${-SLIDE_TOGGLE_BAR_TRACK_WIDTH}px, 0, 0);
    }
  }
}

/* If the label should be placed before the thumb then we just change the orders. */
&[data-label-before=true] {
  ${SlideToggleLabel} { order: 1; }
  ${SlideToggleBar} { order: 2; }
}

[dir=rtl] &[data-label-before=true] ${SlideToggleBar}, ${SlideToggleBar} {
  margin-right: ${SLIDE_TOGGLE_SPACING}px;
  margin-left: 0;
}

[dir=rtl] &, &[data-label-before=true] {
  ${SlideToggleBar} {
    margin-left: ${SLIDE_TOGGLE_SPACING}px;
    margin-right: 0;
  }
}

&[data-label-empty] { margin-left: 0; margin-right: 0; }

// Theme
${themeThunk(components)}
`;
