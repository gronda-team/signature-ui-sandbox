import styled, { css } from 'styled-components';
import { fill } from '../core/style/layout';
import { IconRoot } from '../Icon/styles';
import { getColor } from '../core/theming/util';
import { EASE_OUT_DURATION, EASE_OUT_TIMING_FUNCTION } from '../core/style/variables';
import {
  assignOverlayActiveColor, assignOverlayColor,
  assignOverlayHoverColor,
  basicButtonTheming,
  defaultButtonTheming,
} from '../core/style/button-common';

// Border radii
const buttonSquareBorderRadius = '0';
const buttonShapedBorderRadius = '8px';
const buttonRoundBorderRadius = '10000px';

// Small sizes
const buttonSmallLineHeight = '36px';
const buttonSmallSidePadding = '12px';
const buttonDenseSmallLineHeight = '30px';
const buttonDenseSmallSidePadding = '4px';
// Medium sizes
const buttonMediumLineHeight = '42px';
const buttonMediumSidePadding = '16px';
const buttonDenseMediumLineHeight = '36px';
const buttonDenseMediumSidePadding = '8px';
// Large sizes
const buttonLargeLineHeight = '48px';
const buttonLargeSidePadding = '20px';
const buttonDenseLargeLineHeight = '42px';
const buttonDenseLargeSidePadding = '12px';
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

const overlayOffset = '2px';

export const ButtonToggleLabelContent = styled.div`
  user-select: none;
  display: inline-block;

  // Prevents IE from shifting the content on click.
  position: relative;
  
  & > * {
    vertical-align: middle;
  }
`;

const baseGroupStyling = css`
  position: relative;
  display: inline-flex;
  flex-direction: row;
  white-space: nowrap;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  border-radius: ${buttonShapedBorderRadius}
  
  &[data-shape="square"] {
    border-radius: ${buttonSquareBorderRadius};
  }
  
  &[data-shape="round"] {
    border-radius: ${buttonRoundBorderRadius};
  }

  @media (-ms-high-contrast: active) {
    outline: solid 1px;
  }
`;

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

function fillButtonTheming(props) {
  const colors = props.theme.colors;

  const { fullColorTheme, mediaQueryNoHover } = Object.keys(colors).reduce((acc, name) => {
    let currentColor;
    let mediaQueryNoHover = '';
    let fullColorTheme = '';
    const inactiveColor = getColor(colors.GREY, 300);
    const inactiveHoverColor = getColor(colors.GREY, 400);
    const textShade = 800;
    if (name === 'GREY') {
      currentColor = colors.GREY;

      mediaQueryNoHover = `
        &[data-color="grey"] {
          ${assignOverlayHoverColor('background-color', 'transparent')};
          ${assignOverlayActiveColor('background-color', getColor(currentColor, 900, 0.15))};
        }
      `;

      fullColorTheme = `
        &[data-color="grey"] {
          color: ${getColor(currentColor, textShade)};
          
          ${assignOverlayColor('background-color', 'transparent')}
          ${assignOverlayHoverColor('background-color', getColor(currentColor, 900, 0.08))}
          ${assignOverlayActiveColor('background-color', getColor(currentColor, 900, 0.15))}
          
          &[disabled] {
            color: ${getColor(currentColor, textShade, 0.6)};
          }
        }
      `;
    } else {
      currentColor = colors[name];
      const colorName = name.toLowerCase();
      const activeTextShade = 50;

      mediaQueryNoHover = `
        &[data-color="${colorName}"] {
          ${assignOverlayHoverColor('background-color', inactiveColor)}
        }
      `;

      fullColorTheme = `
        &[data-color="${colorName}"] {
          color: ${getColor(colors.GREY, textShade)};
          ${assignOverlayColor('background-color', inactiveColor)}
          ${assignOverlayHoverColor('background-color', inactiveHoverColor)}
          
          &[data-checked="true"] {
            color: ${getColor(colors.GREY, activeTextShade)};
            ${assignOverlayColor('background-color', getColor(currentColor, 500))}
            ${assignOverlayHoverColor('background-color', getColor(currentColor, 550))}
          }
          
          &[disabled] {
            color: ${getColor(colors.GREY, 0, 0.6)};
          }
        }
      `;
    }

    acc.fullColorTheme += fullColorTheme;
    acc.mediaQueryNoHover += mediaQueryNoHover;

    return acc;
  }, { fullColorTheme: '', mediaQueryNoHover: '' });

  return css`
    ${fullColorTheme}
  
    &[disabled] [data-sui-role="overlay"] {
      opacity: 0.6;
    }
    
    @media (hover:none) {
      ${mediaQueryNoHover}
    }
  `;
}

export const ButtonToggleOverlay = styled.div`
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

export const ButtonToggleButton = styled.div`
  border: 0;
  background: none;
  color: inherit;
  padding: 0;
  margin: 0;
  font: inherit;
  outline: none;
  width: 100%; // Stretch the button in case the consumer set a custom width.
  cursor: pointer;

  [data-disabled="true"] & {
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
  
  // Fixes SVG icons that get thrown off because of the "vertical-align" on the parent.
  ${IconRoot} svg {
    vertical-align: top;
  }
  
  ${ButtonToggleOverlay} {
    transition: background-color ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION};
  }
  
  &[data-standalone="true"] {
    ${baseGroupStyling}
  }
  
  &[data-size="small"] ${ButtonToggleLabelContent} {
    line-height: ${buttonSmallLineHeight};
    padding: 0 ${buttonSmallSidePadding};
  } 
    
  &[data-size="small"][data-dense="true"] ${ButtonToggleLabelContent} {
    line-height: ${buttonDenseSmallLineHeight};
    padding: 0 ${buttonDenseSmallSidePadding};
  }
  
  &[data-size="medium"] ${ButtonToggleLabelContent} {
    line-height: ${buttonMediumLineHeight};
    padding: 0 ${buttonMediumSidePadding};
  } 
    
  &[data-size="medium"][data-dense="true"] ${ButtonToggleLabelContent} {
    line-height: ${buttonDenseMediumLineHeight};
    padding: 0 ${buttonDenseMediumSidePadding};
  }
  
  &[data-size="large"] ${ButtonToggleLabelContent} {
    line-height: ${buttonLargeLineHeight};
    padding: 0 ${buttonLargeSidePadding};
  } 
    
  &[data-size="large"][data-dense="true"] ${ButtonToggleLabelContent} {
    line-height: ${buttonDenseLargeLineHeight};
    padding: 0 ${buttonDenseLargeSidePadding};
  }
  
  &[data-appearance="default"] {
    ${defaultButtonTheming}
    
    ${ButtonToggleOverlay} {
      opacity: 0;
    }
  }
  
  &[data-appearance="basic"] {
    ${basicButtonTheming}
    
    ${ButtonToggleOverlay} {
      border-radius: ${buttonShapedBorderRadius}
      top: ${overlayOffset};
      left: ${overlayOffset};
      bottom: ${overlayOffset};
      right: ${overlayOffset};
    }
    
    &[data-shape="square"] ${ButtonToggleOverlay} {
      border-radius: ${buttonSquareBorderRadius};
    }
    
    &[data-shape="round"] ${ButtonToggleOverlay} {
      border-radius: ${buttonRoundBorderRadius};
    }
  }
  
  &[data-appearance="fill"] {
    ${fillButtonTheming}
  }
  
  ${baseButtonTheming}
`;

export const ButtonToggleGroupRoot = styled.div`
  ${baseGroupStyling}
`;
