import styled, { css } from 'styled-components';
import { EASE_OUT_DURATION, EASE_OUT_TIMING_FUNCTION } from '../core/style/variables';

const sliderThickness = '48px';
const sliderMinSize = '128px';
const sliderPadding = '8px';

const sliderTrackThickness = '2px';
const sliderThumbSize = '20px';
const sliderThumbBorderWidth = '3px';
const sliderThumbBorderWidthActive = '2px';
const sliderThumbBorderWidthDisabled = '4px';

const sliderThumbDefaultScale = '0.7';
const sliderThumbFocusScale = '1';
const sliderThumbDisabledScale = '0.5';

const sliderThumbArrowGap = '12px';
const sliderThumbLabelSize = '28px';
const sliderTickSize = '2px';

const sliderFocusRingSize = '30px';

function baseTheme(props) {

}

function baseTypography(props) {

}

export const SliderWrapper = styled.div`
  position: absolute;
`;

export const SliderTrackWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
`;

export const SliderTrackFill = styled.div`
  position: absolute;
  transform-origin: 0 0;
  transition: transform ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION},
    background-color ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION};
`;

export const SliderTrackBackground = styled.div`
  position: absolute;
  transform-origin: 100% 100%;
  transition: transform ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION},
    background-color ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION};
`;

export const SliderTicksContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  overflow: hidden;
`;

export const SliderTicks = styled.div`
  background-repeat: repeat;
  background-clip: content-box;
  box-sizing: border-box;
  opacity: 0;
  transition: opacity ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION};
`;

export const SliderThumbContainer = styled.div`
  position: absolute;
  z-index: 1;
  transition: transform ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION};
`;

export const SliderFocusRing = styled.div`
  position: absolute;
  width: ${sliderFocusRingSize};
  height: ${sliderFocusRingSize};
  border-radius: 50%;
  transform: scale(0);
  opacity: 0;
  transition: transform ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION},
    background-color ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION},
    opacity ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION};
    
  [data-cdk-focus="keyboard"] &,
  [data-cdk-focus="program"] & {
    transform: scale(1);
    opacity: 1;
  }
`;

export const SliderThumb = styled.div`
  position: absolute;
  right: calc(${sliderThumbSize} / -2);
  bottom: calc(${sliderThumbSize} / -2);
  box-sizing: border-box;
  width: ${sliderThumbSize}
  height: ${sliderThumbSize}
  border: ${sliderThumbBorderWidth} solid transparent;
  border-radius: 50%;
  transform: scale(${sliderThumbDefaultScale});
  transition: transform ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION},
    background-color ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION},
    border-color ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION};
`;

export const SliderThumbLabel = styled.div`
  display: none;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: ${sliderThumbLabelSize};
  height: ${sliderThumbLabelSize};
  border-radius: 50%;
  transition: transform ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION},
    border-radius ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION},
    border-color ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION};
    
  @media (-ms-high-contrast: active) {
    outline: solid 1px;
  }
`;

export const SliderThumbLabelText = styled.div`
  z-index: 1;
  opacity: 0;
  transition: opacity ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION};
`;

export const SliderRoot = styled.div`
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  padding: ${sliderPadding};
  outline: none;
  vertical-align: middle;
  
  &:not([data-disabled="true"]):active,
  &[data-sliding="true"]:not([data-disabled="true"]) {
    cursor: grabbing;
  }
  
  &:not([data-disabled="true"]):not([data-sliding="true"]) {
    ${SliderThumb}, ${SliderThumbLabel} {
      cursor: grabbing;
    }
  }
  
  &[data-sliding="true"] {
    ${SliderTrackFill}, ${SliderTrackBackground}, ${SliderThumbContainer} {
      // Must use "transition-duration: 0ms" to disable animation rather than "transition: none".
      // On Mobile Safari "transition: none" causes the slider thumb to appear stuck.
      transition-duration: 0ms;
    }
  }
  
  &[data-has-ticks="true"] {
    ${SliderWrapper}::after {
      content: '';
      position: absolute;
      border-width: 0;
      border-style: solid;
      opacity: 0;
      transition: opacity ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION};
    }
    
    &[data-cdk-focus], &:hover {
      &:not([data-hide-last-tick="true"]) {
        ${SliderWrapper}::after {
          opacity: 1;
        }
      }
      
      &:not([data-disabled="true"]) ${SliderTicks} {
        opacity: 1;
      }
    }
  }
  
  // Slider with thumb label
  &[data-thumb-label-showing="true"] {
    ${SliderFocusRing} {
      display: none;
    }
    
    ${SliderThumbLabel} {
      display: flex;
    }
  }
  
  // Inverted slider
  &[data-axis-inverted="true"] {
    ${SliderTrackFill} {
      transform-origin: 100% 100%;
    }
    
    ${SliderTrackBackground} {
      transform-origin: 0 0;
    }
  }
  
  // Active slider
  &:not([data-disabled="true"]) {
    &[data-cdk-focus] {
      &[data-thumb-label-showing="true"] ${SliderThumb} {
        transform: scale(0);
      }
      
      ${SliderThumbLabel} {
        border-radius: 50% 50% 0;
      }
      
      ${SliderThumbLabelText} {
        opacity: 1;
      }
    }
    
    &[data-cdk-focus="mouse"],
    &[data-cdk-focus="touch"],
    &[data-cdk-focus="program"] {
      ${SliderThumb} {
        border-width: ${sliderThumbBorderWidthActive};
        transform: scale(${sliderThumbFocusScale});
      }
    }
  }
  
  // Disabled slider
  &[data-disabled="true"] {
    ${SliderFocusRing} {
      transform: scale(0);
      opacity: 0;
    }
    
    ${SliderThumb} {
      border-width: ${sliderThumbBorderWidthDisabled};
      transform: scale(${sliderThumbDisabledScale});
    }
    
    ${SliderThumbLabel} {
      display: none;
    }
  }
  
  &[data-horizontal="true"] {
    height: ${sliderThickness};
    min-width: ${sliderMinSize};
    
    ${SliderWrapper} {
      height: ${sliderTrackThickness};
      top: calc((${sliderThickness} - ${sliderTrackThickness}) / 2);
      left: ${sliderPadding};
      right: ${sliderPadding};
    }
    
    ${SliderWrapper}::after {
      height: ${sliderTrackThickness};
      border-left-width: ${sliderTickSize};
      right: 0;
      top: 0;
    }
    
    ${SliderTrackWrapper} {
      height: ${sliderTrackThickness};
      width: 100%;
    }
    
    ${SliderTrackFill} {
      height: ${sliderTrackThickness};
      width: 100%;
      transform: scaleX(0);
    }
    
    ${SliderTrackBackground} {
      height: ${sliderTrackThickness};
      width: 100%;
      transform: scaleX(1);
    }
    
    ${SliderTicksContainer} {
      height: ${sliderTrackThickness};
      width: 100%;
      
      @media (-ms-high-contrast: active) {
        height: 0;
        outline: solid ${sliderTrackThickness};
        top: calc(${sliderTrackThickness} / 2);
      }
    }
    
    ${SliderTicks} {
      height: ${sliderTrackThickness};
      width: 100%;
    }
    
    ${SliderThumbContainer} {
      width: 100%;
      height: 0;
      top: 50%;
    }
    
    ${SliderFocusRing} {
      top: calc(${sliderFocusRingSize} / -2);
      right: calc(${sliderFocusRingSize} / -2);
    }
    
    ${SliderThumbLabel} {
      right: calc(${sliderThumbLabelSize} / -2);
      top: calc((${sliderThumbLabelSize} + ${sliderThumbArrowGap}) * -1);
      transform: translateY(calc(${sliderThumbLabelSize} / 2 + ${sliderThumbArrowGap}))
        scale(0.01)
        rotate(45deg);
    }
    
    ${SliderThumbLabelText} {
      transform: rotate(-45deg);
    }
    
    &[data-cdk-focus] {
      ${SliderThumbLabel} {
        transform: rotate(45deg);
      }
      
      @media (-ms-high-contrast: active) {
        ${SliderThumbLabel}, ${SliderThumbLabelText} { 
          transform: none;
        }
      }
    }
  }
  
  [dir="rtl"] & {
    ${SliderWrapper}::after {
      left: 0;
      right: auto;
    }
    
    &[data-horizontal="true"] {
      ${SliderTrackFill} {
        transform-origin: 100% 100%;
      }
      
      ${SliderTrackBackground} {
        transform-origin: 0 0;
      }
      
      &[data-axis-inverted="true"] {
        ${SliderTrackFill} {
          transform-origin: 0 0;
        }
        
        ${SliderTrackBackground} {
          transform-origin: 100% 100%;
        }
      }
    }
  }
`;
