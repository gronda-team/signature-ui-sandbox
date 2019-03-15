import { css } from 'styled-components';
import BUTTON_RESET from '../../core/styles/button-common';

// flat and raised button standards
const BUTTON_PADDING = '0 24px';
const BUTTON_MIN_WIDTH = 64; // px
const BUTTON_MARGIN = 0;
const BUTTON_LINE_HEIGHT = 36;
const BUTTON_BORDER_RADIUS = 3;

// Stroked button padding is 1px less horizontally than default/flat/raised button's padding.
const STROKED_BUTTON_LINE_HEIGHT = BUTTON_LINE_HEIGHT - 2;
const STROKED_BUTTON_PADDING = '0 23px';
const STROKED_BUTTON_BORDER_WIDTH = '1px';

// Icon Button standards
const ICON_BUTTON_SIZE = 36;
const ICON_BUTTON_BORDER_RADIUS = BUTTON_BORDER_RADIUS;
const ICON_BUTTON_LINE_HEIGHT = 24; // px

// Fab standards
const FAB_BORDER_RADIUS = '50%';
const FAB_SIZE = 56; // px
const FAB_PADDING = 16; // px


export const buttonBaseThunk = (components) => {
  const { FocusOverlay } = components;
  return css`
  box-sizing: border-box;
  position: relative;
  // Reset browser button styles.
  ${BUTTON_RESET}
  
  // make anchors render like buttons;
  display: inline-block;
  white-space: nowrap;
  text-decoration: none;
  vertical-align: baseline;
  text-align: center;
  
  // Sizing.
  margin: ${BUTTON_MARGIN};
  min-width: ${BUTTON_MIN_WIDTH}px;
  line-height: ${BUTTON_LINE_HEIGHT}px;
  padding: ${BUTTON_PADDING};
  border-radius: ${BUTTON_BORDER_RADIUS}px;
  // Offset to correct inline form heights
  bottom: 1px;
  
  // Explicitly set the default overflow to "visible". It is already set
  // on most browsers except on IE11 where it defaults to "hidden".
  overflow: visible;
  
  &[disabled] {
    cursor: default;
  }
  
  &[data-focus-origin=keyboard], &[data-focus-origin=program] {
    ${FocusOverlay} {
      opacity: 0.12;
    }
  }
  
  &::-moz-focus-inner {
    border: 0;
  }
  `;
};

export const raisedButtonThunk = components => {
  return css`
  ${buttonBaseThunk(components)}

  // Force hardware acceleration.
  transform: translate3d(0, 0, 0);
  `;
};

export const strokedButtonThunk = components => {
  const { FocusOverlay } = components;
  return css`
  border: solid ${STROKED_BUTTON_BORDER_WIDTH} currentColor;
  padding: ${STROKED_BUTTON_PADDING};
  line-height: ${STROKED_BUTTON_LINE_HEIGHT}px;
  
  // Since the stroked button has has an actual border that reduces the available space for
  // child elements such as the ripple container or focus overlay, an inherited border radius
  // for the absolute-positioned child elements does not work properly. This is because the
  // child element cannot expand to the same boundaries as the parent element with a border.
  // In order to work around this issue by *not* hiding overflow, we adjust the child elements
  // to fully cover the actual button element. This means that the border-radius would be correct
  // then. See: https://github.com/angular/material2/issues/13738
  ${FocusOverlay} {
    top: -${STROKED_BUTTON_BORDER_WIDTH};
    left: -${STROKED_BUTTON_BORDER_WIDTH};
    right: -${STROKED_BUTTON_BORDER_WIDTH};
    bottom: -${STROKED_BUTTON_BORDER_WIDTH};
  }
  `;
};

export const fabThunk = components => {
  const { Wrapper } = components;
  return css`
  ${raisedButtonThunk(components)}

  // Reset the min-width from the button base.
  min-width: 0;

  border-radius: ${FAB_BORDER_RADIUS};
  width: ${FAB_SIZE}px;
  height: ${FAB_SIZE}px;
  padding: 0;

  flex-shrink: 0;

  ${Wrapper} {
    padding: ${FAB_PADDING}px 0;
    display: inline-block;
    line-height: ${ICON_BUTTON_LINE_HEIGHT}px;
  }
  `;
};

export const iconThunk = () => css`
padding: 0;
// Remove offset because icons don't suffer from this penalty
bottom: 0;
// Reset the min-width from the button base.
min-width: 0;

width: ${ICON_BUTTON_SIZE}px;
height: ${ICON_BUTTON_SIZE}px;

flex-shrink: 0;
line-height: ${ICON_BUTTON_SIZE}px;
border-radius: ${ICON_BUTTON_BORDER_RADIUS}px;

i {
  line-height: ${ICON_BUTTON_LINE_HEIGHT};
}
`;

export const fullThunk = () => css`
box-sizing: border-box;
width: 100%;
`;
