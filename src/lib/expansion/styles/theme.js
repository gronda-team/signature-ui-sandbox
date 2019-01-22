import { keyframes, css } from 'styled-components';
import { GREY } from '../../../components/core/theme/colors';

const background = 'white';
const hoverBackground = GREY[100];
const text = GREY[900];
const secondaryText = GREY[700];
const border = GREY[700];
const disabled = GREY[500];

const accordionThemeThunk = (components) => {
  const {
    Panel,
    ActionRow,
    PanelHeader,
    PanelContent,
    PanelTitle,
    PanelDescription,
  } = components;
  return css`
  ${Panel} {
    background: ${background};
    color: ${text};
  }
  
  ${PanelHeader} {
    font-size: 15px;
    line-height: 24px;
  }
  
  ${PanelContent} {
    font-size: 14px;
  }
  
  ${ActionRow} { border-top-color: ${border}; }
  
  ${Panel}:not([data-expanded=true]) ${PanelHeader} {
    &:not([aria-disabled=true]) {
      &:hover {
        background: ${hoverBackground};
      }
    }
  }
  
  @media (hover:none) {
    ${Panel}:not([data-expanded=true]):not([aria-disabled=true]) {
      ${PanelHeader}:hover {
        background: ${background};
      }
    }
  }
  
  ${PanelTitle} {
    color: ${text};
  }
  
  ${PanelDescription} {
    color: ${secondaryText};
  }
  
  ${PanelHeader}[aria-disabled=true] {
    color: ${disabled};
    
    ${PanelTitle}, ${PanelDescription} {
      color: inherit;
    }
  }
  `;
};

export default accordionThemeThunk;
