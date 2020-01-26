import styled, { css } from 'styled-components';
import buttonCommon, {
  basicButtonTheming,
  defaultButtonTheming,
  fillButtonTheming,
  strokedButtonTheming,
} from '../core/style/button-common';
import { fill } from '../core/style/layout';
import { IconRoot } from '../Icon/styles';
import { EASE_OUT_DURATION, EASE_OUT_TIMING_FUNCTION } from '../core/style/variables';

// Border radii
const buttonRoundBorderRadius = '8px';
const buttonCircleBorderRadius = '50%';

// Small sizes
const buttonSmallLineHeight = '36px';
const buttonSmallSidePadding = '16px';
const buttonDenseSmallLineHeight = '30px';
const buttonDenseSmallSidePadding = '12px';
// Medium sizes
const buttonMediumLineHeight = '42px';
const buttonMediumSidePadding = '20px';
const buttonDenseMediumLineHeight = '36px';
const buttonDenseMediumSidePadding = '12px';
// Large sizes
const buttonLargeLineHeight = '48px';
const buttonLargeSidePadding = '24px';
const buttonDenseLargeLineHeight = '42px';
const buttonDenseLargeSidePadding = '16px';
// Stroked
const strokedButtonThinWidth = '1px';
const strokedButtonThickWidth = '2px';
// Icon buttons
const iconButtonLineHeight = '24px';
const iconButtonSmallSize = buttonSmallLineHeight;
const iconButtonDenseSmallSize = buttonDenseSmallLineHeight;
const iconButtonMediumSize = buttonMediumLineHeight;
const iconButtonDenseMediumSize = buttonDenseMediumLineHeight;
const iconButtonLargeSize = buttonLargeLineHeight;
const iconButtonDenseLargeSize = buttonDenseLargeLineHeight;

const buttonBase = css`
  box-sizing: border-box;
  position: relative;
  
  // Reset browser button styles.
  ${buttonCommon}
  
  // Make anchors render like buttons.
  display: inline-block;
  white-space: nowrap;
  text-decoration: none;
  vertical-align: baseline;
  text-align: center;
  margin: 0;
  
  // Common sizing
  border-radius: ${buttonRoundBorderRadius};
  
  // Explicitly set the default overflow to "visible". It is already set
  // on most browsers except on IE11 where it defaults to "hidden".
  overflow: visible;
  
  &[disabled] {
    cursor: default;
  }
  
  &::-moz-focus-inner {
    border: 0;
  }
`;

export const ButtonOverlay = styled.div`
  ${fill}

  // Disable pointer events for the ripple container and focus overlay because the container
  // will overlay the user content and we don't want to disable mouse events on the user content.
  // Pointer events can be safely disabled because the ripple trigger element is the host element.
  pointer-events: none;

  // Inherit the border radius from the parent so that focus overlay and ripples don't exceed the
  // parent button boundaries. Note that an inherited border radius does not work properly if
  // the actual button element does have a border because it causes the inner content to be
  // smaller. We have special logic for stroked buttons to handle this scenario.
  border-radius: inherit;
  
  // Position the scrim behind the text.
  z-index: -1;
`;

export const ButtonWrapper = styled.div``;

function iconButtonStyle() {
  return css`
    padding: 0;
    
    // Reset the min-width property from the button base
    min-width: 0;
    flex-shrink: 0;
    
    i, ${IconRoot} {
      line-height: ${iconButtonLineHeight};
    }
  
    &[data-size="small"] {
      width: ${iconButtonSmallSize};
      height: ${iconButtonSmallSize};
      line-height: ${iconButtonSmallSize};
      
      &[data-dense="true"] {
        width: ${iconButtonDenseSmallSize};
        height: ${iconButtonDenseSmallSize};
      }
    }
    
    &[data-size="medium"] {
      width: ${iconButtonMediumSize};
      height: ${iconButtonMediumSize};
      line-height: ${iconButtonMediumSize};
      
      &[data-dense="true"] {
        width: ${iconButtonDenseMediumSize};
        height: ${iconButtonDenseMediumSize};
      }
    }
    
    &[data-size="large"] {
      width: ${iconButtonLargeSize};
      height: ${iconButtonLargeSize};
      line-height: ${iconButtonLargeSize};
      
      &[data-dense="true"] {
        width: ${iconButtonDenseLargeSize};
        height: ${iconButtonDenseLargeSize};
      }
    }
  `;
}

function strokedButtonStyle() {
  return css`
    border-style: solid;
    
    &[data-stroke-width="thin"] {
      border-width: ${strokedButtonThinWidth};
      
      ${ButtonOverlay} {
        top: -${strokedButtonThinWidth};
        left: -${strokedButtonThinWidth};
        bottom: -${strokedButtonThinWidth};
        right: -${strokedButtonThinWidth};
      }
  
      &[data-size="small"] {
        line-height: calc(${buttonSmallLineHeight} - (2 * ${strokedButtonThinWidth}));
        padding: 0 calc(${buttonSmallSidePadding} - ${strokedButtonThinWidth});
        
        &[data-dense="true"] {
          line-height: calc(${buttonDenseSmallLineHeight} - (2 * ${strokedButtonThinWidth}));
          padding: 0 calc(${buttonDenseSmallSidePadding} - ${strokedButtonThinWidth});
        }
      }
      
      &[data-size="medium"] {
        line-height: calc(${buttonMediumLineHeight} - (2 * ${strokedButtonThinWidth}));
        padding: 0 calc(${buttonMediumSidePadding} - ${strokedButtonThinWidth}); 
        
        &[data-dense="true"] {
          line-height: calc(${buttonDenseMediumLineHeight} - (2 * ${strokedButtonThinWidth}));
          padding: 0 calc(${buttonDenseMediumSidePadding} - ${strokedButtonThinWidth});
        }
      }
      
      &[data-size="large"] {
        line-height: calc(${buttonLargeLineHeight} - (2 * ${strokedButtonThinWidth}));
        padding: 0 calc(${buttonLargeSidePadding} - ${strokedButtonThinWidth}); 
        
        &[data-dense="true"] {
          line-height: calc(${buttonDenseLargeLineHeight} - (2 * ${strokedButtonThinWidth}));
          padding: 0 calc(${buttonDenseLargeSidePadding} - ${strokedButtonThinWidth});
        }
      }
    }
    
    &[data-stroke-width="thick"] {
      border-width: ${strokedButtonThickWidth};
      
      ${ButtonOverlay} {
        top: -${strokedButtonThickWidth};
        left: -${strokedButtonThickWidth};
        bottom: -${strokedButtonThickWidth};
        right: -${strokedButtonThickWidth};
      }
  
      &[data-size="small"] {
        line-height: calc(${buttonSmallLineHeight} - (2 * ${strokedButtonThickWidth}));
        padding: 0 calc(${buttonSmallSidePadding} - ${strokedButtonThickWidth});
        
        &[data-dense="true"] {
          line-height: calc(${buttonDenseSmallLineHeight} - (2 * ${strokedButtonThickWidth}));
          padding: 0 calc(${buttonDenseSmallSidePadding} - ${strokedButtonThickWidth});
        }
      }
      
      &[data-size="medium"] {
        line-height: calc(${buttonMediumLineHeight} - (2 * ${strokedButtonThickWidth}));
        padding: 0 calc(${buttonMediumSidePadding} - ${strokedButtonThickWidth}); 
        
        &[data-dense="true"] {
          line-height: calc(${buttonDenseMediumLineHeight} - (2 * ${strokedButtonThickWidth}));
          padding: 0 calc(${buttonDenseMediumSidePadding} - ${strokedButtonThickWidth});
        }
      }
      
      &[data-size="large"] {
        line-height: calc(${buttonLargeLineHeight} - (2 * ${strokedButtonThickWidth}));
        padding: 0 calc(${buttonLargeSidePadding} - ${strokedButtonThickWidth}); 
        
        &[data-dense="true"] {
          line-height: calc(${buttonDenseLargeLineHeight} - (2 * ${strokedButtonThickWidth}));
          padding: 0 calc(${buttonDenseLargeSidePadding} - ${strokedButtonThickWidth});
        }
      }
    }
  `;
}

function baseButtonTheming(props) {
  return css`
    // Buttons without a background color should inherit the font color. This is necessary to
    // ensure that the button is readable on custom background colors. It's wrong to always assume
    // that those buttons are always placed inside of containers with the default background
    // color of the theme (e.g. themed toolbars).
    color: inherit;
    background: transparent;
  `;
}

function baseButtonTypography() {
  return css`
    font-family: inherit;
    font-weight: inherit;
  
    &[data-size="sm"], &[data-size="small"] {
      font-size: 16px;
    }
    
    &[data-size="md"], &[data-size="medium"] {
      font-size: 18px;
    }
    
    &[data-size="lg"], &[data-size="large"] {
      font-size: 20px;
    }
  `;
}

export const ButtonRoot = styled.div`
  ${buttonBase}
  
  &[data-shape="circle"] {
    border-radius: ${buttonCircleBorderRadius};
  }
  
  &[data-size="sm"], &[data-size="small"] {
    line-height: ${buttonSmallLineHeight};
    padding: 0 ${buttonSmallSidePadding}; 
    
    &[data-dense="true"] {
      line-height: ${buttonDenseSmallLineHeight};
      padding: 0 ${buttonDenseSmallSidePadding};
    }
  }
  
  &[data-size="md"], &[data-size="medium"] {
    line-height: ${buttonMediumLineHeight};
    padding: 0 ${buttonMediumSidePadding}; 
    
    &[data-dense="true"] {
      line-height: ${buttonDenseMediumLineHeight};
      padding: 0 ${buttonDenseMediumSidePadding};
    }
  }
  
  &[data-size="lg"], &[data-size="large"] {
    line-height: ${buttonLargeLineHeight};
    padding: 0 ${buttonLargeSidePadding}; 
    
    &[data-dense="true"] {
      line-height: ${buttonDenseLargeLineHeight};
      padding: 0 ${buttonDenseLargeSidePadding};
    }
  }
  
  &[data-full="true"] {
    width: 100%;
    text-align: center;
  }
  
  &[data-type="icon"] {
    ${iconButtonStyle}
  }
  
  &[data-appearance="stroked"] {
    ${strokedButtonStyle}
    ${strokedButtonTheming}
  }
  
  &[data-appearance="fill"] {
    ${fillButtonTheming}
  }
  
  &[data-appearance="basic"] {
    ${basicButtonTheming}
  }
  
  &[data-appearance="default"] {
    ${defaultButtonTheming}
    
    ${ButtonOverlay} {
      opacity: 0;
    }
  }
  
  ${ButtonOverlay} {
    transition: background-color ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION};
  }
  
  // Elements inside of all type of buttons should be vertical aligned in the middle.
  ${ButtonWrapper} > * {
    vertical-align: middle;
  }
  
  @media (-ms-high-contrast: active) {
    // Add an outline to make buttons more visible in high contrast mode. Stroked buttons
    // don't need a special look in high-contrast mode, because those already have an outline.
    &:not([data-appearance="stroked"]) {
      outline: solid 1px;
    }
  }
  
  ${baseButtonTheming}
  ${baseButtonTypography}
`;
