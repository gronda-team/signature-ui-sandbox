import styled, { css, createGlobalStyle } from 'styled-components';
import PropTypes from 'prop-types';
import { documentElementGlobalStyle, globalOverlayStyle } from '../../../cdk/Overlay/styles';

const BODY_ROOT_SELECTOR = '[data-sui-root="true"]';
const TYPOGRAPHY_ATTRIBUTE = 'data-sui-typography';

function typographySelector(props) {
  const selector = props.theme.typographySelector;
  return selector || TYPOGRAPHY_ATTRIBUTE;
}

function baseTypography() {
  return css`
    [${typographySelector}="display1"] {
      font-size: 112px;
      line-height: 112px;
      font-weight: 300;
      letter-spacing: -0.05em;
      margin: 0 0 56px;
    }
    
    [${typographySelector}="display2"] {
      font-size: 56px;
      line-height: 56px;
      font-weight: 400;
      letter-spacing: -0.02em;
      margin: 0 0 64px;
    }
    
    [${typographySelector}="display3"] {
      font-size: 45px;
      line-height: 48px;
      font-weight: 400;
      letter-spacing: -0.005em;
      margin: 0 0 64px;
    }
    
    [${typographySelector}="display4"] {
      font-size: 34px;
      line-height: 40px;
      font-weight: 400;
      margin: 0 0 64px;
    }
    
    
    [${typographySelector}="h1"], [${typographySelector}] h1:not([${typographySelector}]) {
      font-size: 24px;
      line-height: 32px;
      font-weight: 400;
      margin: 0 0 16px;
    }
    
    [${typographySelector}="h2"], [${typographySelector}] h2:not([${typographySelector}]) {
      font-size: 22px;
      line-height: 32px;
      font-weight: 500;
      margin: 0 0 16px;
    }
    
    [${typographySelector}="h3"], [${typographySelector}] h3:not([${typographySelector}]) {
      font-size: 16px;
      line-height: 28px;
      font-weight: 400;
      margin: 0 0 16px;
    }
    
    [${typographySelector}="h4"], [${typographySelector}] h4:not([${typographySelector}]) {
      font-size: 15px;
      line-height: 24px;
      font-weight: 400;
      margin: 0 0 16px;
    }
    
    [${typographySelector}="h5"], [${typographySelector}] h5:not([${typographySelector}]) {
      font-size: calc(14px * 0.83);
      line-height: 20px;
      font-weight: 400;
      margin: 0 0 12px;
    }
    
    [${typographySelector}="h6"], [${typographySelector}] h6:not([${typographySelector}]) {
      font-size: calc(14px * 0.67);
      line-height: 20px;
      font-weight: 400;
      margin: 0 0 12px;
    }
    
    [${typographySelector}="body1"] {
      font-size: 20px;
      line-height: 24px;
      font-weight: 500;
    }
    
    [${typographySelector}="body2"] {
      font-size: 18px;
      line-height: 22px;
      font-weight: 400;
      
      p {
        margin: 0 0 12px;
      }
    }
    
    [${typographySelector}="micro"], [${typographySelector}="caption"] {
      font-size: 12px;
      line-height: 20px;
      font-weight: 400;
    }
    
    [data-sui-font-weight="regular"], [data-sui-font-weight="normal"] {
      font-weight: 400 !important;
    }
    
    [data-sui-font-weight="bold"] {
      font-weight: 700 !important;
    }
    
    [data-sui-font-weight="demi"], [data-sui-font-weight="demibold"],
    [data-sui-font-weight="demi-bold"] {
      font-weight: 600 !important;
    }
  `;
}

function baseMargins() {
  return css`
    [data-sui-margin="0"] {
      margin: 0;
    }
  `;
}

function baseA11y() {
  return css`
    [data-sui-visually-hidden="true"] {
      border: 0;
      clip: rect(0 0 0 0);
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      width: 1px;
  
      // Avoid browsers rendering the focus ring in some cases.
      outline: 0;
  
      // Avoid some cases where the browser will still render the native controls (see #9049).
      appearance: none;
    }
  `;
}

const globalStyle = css`
  ${baseTypography}
  ${baseMargins}
  ${baseA11y}
  
  ${globalOverlayStyle}
`;

export const ProviderRoot = styled.div`
  ${BODY_ROOT_SELECTOR} & {
    ${globalStyle}
  }
`;

export const GlobalStyles = createGlobalStyle`
  ${BODY_ROOT_SELECTOR} {
    ${globalStyle}
  }
  
  ${documentElementGlobalStyle}
`;

export const TypographyPropTypes = {
  [TYPOGRAPHY_ATTRIBUTE]: PropTypes.oneOf(['display1', 'display2', 'display3', 'display4']),
};

export const TypographyDefaultProps = {
  [TYPOGRAPHY_ATTRIBUTE]: 'body3',
};
