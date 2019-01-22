import { css } from 'styled-components';
import { GREEN, GREY } from '../../../components/core/theme/colors';

// border colors
const ACTIVE_BACKGROUND = GREEN[500];
const ACTIVE_FOREGROUND = 'white';
const INACTIVE_BACKGROUND = 'transparent';
const INACTIVE_FOREGROUND = GREY[900];
const BORDER = GREY[500];

const DISABLED_FOREGROUND = GREY[700];
const DISABLED_BACKGROUND = GREY[100];
const DISABLED_ACTIVE_BACKGROUND = GREEN[400];

export const themeThunk = (components) => {
  // root context is ButtonToggleGroupRoot, not ButtonToggleRoot
  const { FocusOverlay, ButtonToggle } = components;
  return css`
  ${ButtonToggle} {
    color: ${INACTIVE_FOREGROUND};
    background-color: ${INACTIVE_BACKGROUND};
    
    ${FocusOverlay} {
      background-color: ${BORDER};
    }
  }
  
  ${ButtonToggle} + ${ButtonToggle} {
    border-left: solid 1px ${BORDER};
  
    [dir=rtl] & {
      border-left: none;
      border-right: solid 1px ${BORDER};
    }
  }
  
  &[data-vertical=true] {
    ${ButtonToggle} + ${ButtonToggle} {
      border-left: none;
      border-right: none;
      border-top: solid 1px ${BORDER};
    }
  }
  
  ${ButtonToggle} {
    &[data-checked=true] {
      background-color: ${ACTIVE_BACKGROUND};
      color: ${ACTIVE_FOREGROUND};
    }
    
    &[data-disabled=true] {
      background-color: ${DISABLED_BACKGROUND};
      color: ${DISABLED_FOREGROUND};
      &[data-checked=true] {
        background-color: ${DISABLED_ACTIVE_BACKGROUND};
      }
    }
  }
  
  &, ${ButtonToggle}[data-standalone=true] { border: solid 1px ${BORDER}; }
  `;
};

export default themeThunk;
