import styled, { css } from 'styled-components';
import { truncateLine } from '../core/style/list-common';
import { SWIFT_LINEAR } from '../core/style/variables';
import { getColor } from '../core/theming/util';

const TOGGLE_THUMB_SIZE = '26px';
const TOGGLE_BAR_BORDER_RADIUS = '15px';
const TOGGLE_HEIGHT = '32px';
const TOGGLE_SPACING = '8px';
const TOGGLE_BAR_WIDTH = '48px';
const TOGGLE_BAR_HEIGHT = '30px';
const TOGGLE_BAR_TRACK_WIDTH = `calc(${TOGGLE_BAR_WIDTH} - ${TOGGLE_THUMB_SIZE})`;

// The container includes the visual thumb and the ripple container element.
export const SlideToggleThumbContainer = styled.div`
  position: absolute;
  z-index: 1;
  
  width: ${TOGGLE_THUMB_SIZE};
  height: ${TOGGLE_THUMB_SIZE};
  top: calc(((${TOGGLE_THUMB_SIZE} - ${TOGGLE_BAR_HEIGHT}) / 2) * -1);
  left: 2px;
  
  transform: translate3d(0, 0, 0);
  transition: ${SWIFT_LINEAR};
  transition-property: transform;
  
  [dir="rtl"] & {
    left: auto;
    right: 2px;
  }
`;

const transitionBackgroundColor = css`
  transition: ${SWIFT_LINEAR};
  transition-property: background-color:
  transition-delay: 50ms;
`;

// The visual thumb element that moves inside of the thumb bar.
// The parent thumb-container container is responsible for the movement of the visual thumb.
export const SlideToggleThumb = styled.div`
  height: ${TOGGLE_THUMB_SIZE};
  width: ${TOGGLE_THUMB_SIZE};
  border-radius: 50%;
  
  ${transitionBackgroundColor}
`;

// The label element is our root container for the slide-toggle / switch indicator and label text.
// It has to be a label, to support accessibility for the visual hidden input.
export const SlideToggleLabel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  height: inherit;
  cursor: pointer;
`;

export const SlideToggleBar = styled.div`
  margin-right: ${TOGGLE_SPACING};
  margin-left: 0;
  
  [dir="rtl"] & {
    margin-left: ${TOGGLE_SPACING};
    margin-right: 0;
  }
  
  &[data-no-side-margin="true"] {
    margin-left: 0;
    margin-right: 0;
  }
  
  position: relative;
  width: ${TOGGLE_BAR_WIDTH};
  height: ${TOGGLE_BAR_HEIGHT};
  
  flex-shrink: 0;
  
  border-radius: ${TOGGLE_BAR_BORDER_RADIUS};
  
  ${transitionBackgroundColor}
`;

// The slide toggle shows a visually hidden input inside of the component, which is used
// to take advantage of the native browser functionality.
export const SlideToggleInput = styled.div`
  // Move the input to the bottom and in the middle of the thumb.
  // Visual improvement to properly show browser popups when being required.
  bottom: 0;
  left: calc(${TOGGLE_THUMB_SIZE} / 2);
  
  [dir="rtl"] & {
    left: auto;
    right: calc(${TOGGLE_THUMB_SIZE} / 2);
  }
`;

export const SlideToggleContent = styled.div`
  ${truncateLine}
`;

function baseTheme(props) {
  const colors = props.theme.colors;

  const primary = getColor(colors.PRIMARY);
  const accent = getColor(colors.ACCENT);
  const warn = getColor(colors.WARN);

  return css`
    &[data-checked="true"] {      
      ${SlideToggleBar} {
        background-color: ${getColor(primary)};
      }      
      
      &[data-color="accent"] ${SlideToggleBar} {
        background-color: ${getColor(accent)};
      }
      
      &[data-color="warn"] ${SlideToggleBar} {
        background-color: ${getColor(warn)};
      }
    }
    
    ${SlideToggleThumb} {
      background-color: white;
    }
    
    ${SlideToggleBar} {
      background-color: ${getColor(colors.GREY, 200)};
    }
  `;
}

export const SlideToggleRoot = styled.div`
  display: inline-block;
  height: ${TOGGLE_HEIGHT};
  max-width: 100%;
  
  line-height: ${TOGGLE_HEIGHT};
  white-space: nowrap;
  outline: none;
  
  -webkit-tap-highlight-color: transparent;
  
  &[data-checked="true"] {
    ${SlideToggleThumbContainer} {
      transform: translate3d(calc(${TOGGLE_BAR_TRACK_WIDTH} - 4px), 0, 0);
      
      [dir="rtl"] & {
        transform: translate3d(calc((${TOGGLE_BAR_TRACK_WIDTH} - 4px) * -1), 0, 0);
      }
    }
  }
  
  &[data-disabled="true"] {
    opacity: 0.38;
    
    ${SlideToggleLabel}, ${SlideToggleThumbContainer} {
      cursor: default;
    }
  }
  
  // If the label should be placed before the thumb then we just change the orders.
  &[data-label-before="true"] {
    ${SlideToggleLabel} {
      order: 1;
    }
    
    ${SlideToggleBar} {
      order: 2;
      margin-left: ${TOGGLE_SPACING};
      margin-right: 0;
    }
  }
    
  // Apply the margin for slide-toggles and revert it for RTL toggles with labelPosition before.
  [dir="rtl"] &[data-label-before="true"] {
    ${SlideToggleBar} {
      margin-right: ${TOGGLE_SPACING};
      margin-left: 0;
    }
  }
  
  ${baseTheme}
`;
