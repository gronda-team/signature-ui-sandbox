import { css } from 'styled-components';
import { getColor } from '../theming/util';

export default css`
  user-select: none;
  cursor: pointer;
  outline: none;
  border: none;
  -webkit-tap-highlight-color: transparent;
  
  // The "outline: none" from above works on all browsers, however Firefox also
  // adds a special "focus-inner" which we have to disable explicitly. See:
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Firefox
  &::-moz-focus-inner {
    border: 0;
  }
`;


export function assignOverlayColor(property, value) {
  return `
    [data-sui-role="overlay"] {
      ${property}: ${value};
    }
  `;
}

export function assignOverlayHoverColor(property, value) {
  return `
    &:not([disabled]):hover,
    &[data-cdk-focus="keyboard"],
    &[data-cdk-focus="program"] {
      [data-sui-role="overlay"] {
        ${property}: ${value};
      }
    }
  `;
}

export function assignOverlayActiveColor(property, value) {
  return `
    &:not([disabled]):active [data-sui-role="overlay"] {
      ${property}: ${value};
    }
  `;
}

export function fillButtonTheming(props) {
  const colors = props.theme.colors;

  const { fullColorTheme, mediaQueryNoHover } = Object.keys(colors).reduce((acc, name) => {
    let currentColor;
    let mediaQueryNoHover = '';
    let fullColorTheme = '';
    if (name === 'GREY') {
      currentColor = colors.GREY;
      const textShade = 800;

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

      mediaQueryNoHover = `
        &[data-color="${colorName}"] {
          ${assignOverlayHoverColor('background-color', getColor(currentColor))}
          ${assignOverlayActiveColor('background-color', getColor(currentColor, 600))}
        }
      `;

      fullColorTheme = `
        &[data-color="${colorName}"] {
          color: white;
          
          ${assignOverlayColor('background-color', getColor(currentColor))}
          ${assignOverlayHoverColor('background-color', getColor(currentColor, 550))}
          ${assignOverlayActiveColor('background-color', getColor(currentColor, 600))}
          
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

export function strokedButtonTheming(props) {
  const colors = props.theme.colors;

  const { fullColorTheme, mediaQueryNoHover } = Object.keys(colors).reduce((acc, name) => {
    let currentColor;
    let mediaQueryNoHover = '';
    let fullColorTheme = '';
    if (name === 'GREY') {
      currentColor = colors.GREY;
      const strokeShade = 600;
      const textShade = 800;

      mediaQueryNoHover = `
        &[data-color="grey"] {
          ${assignOverlayHoverColor('background-color', 'transparent')}
          ${assignOverlayActiveColor('background-color', getColor(currentColor, 900, 0.15))}
        }
      `;

      fullColorTheme = `        
        &[data-color="grey"] {
          color: ${getColor(currentColor, textShade)};
          border-color: ${getColor(currentColor, strokeShade)};
          
          ${assignOverlayColor('background-color', 'transparent')}
          ${assignOverlayHoverColor('background-color', getColor(currentColor, 900, 0.08))}
          ${assignOverlayActiveColor('background-color', getColor(currentColor, 900, 0.15))}
          
          &[disabled] {
            color: ${getColor(currentColor, textShade, 0.6)};
            border-color: ${getColor(currentColor, strokeShade, 0.6)};
          }
        }
      `;
    } else {
      currentColor = colors[name];
      const colorName = name.toLowerCase();

      mediaQueryNoHover = `
        &[data-color="${colorName}"] {
          ${assignOverlayHoverColor('background-color', 'transparent')}
          ${assignOverlayActiveColor('background-color', getColor(currentColor, 500, 0.15))}
        }
      `;

      fullColorTheme = `
        &[data-color="${colorName}"] {
          border-color: ${getColor(currentColor)};
          color: ${getColor(currentColor)};
          
          ${assignOverlayColor('background-color', 'transparent')}
          ${assignOverlayHoverColor('background-color', getColor(currentColor, 500, 0.08))}
          ${assignOverlayActiveColor('background-color', getColor(currentColor, 500, 0.15))}
          
          &[disabled] {
            border-color: ${getColor(currentColor, 0.6)};
            color: ${getColor(currentColor, 0.6)};
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
      opacity: 0;
    }
    
    @media (hover:none) {
      ${mediaQueryNoHover}
    }
  `;
}

export function basicButtonTheming(props) {
  const colors = props.theme.colors;

  const { fullColorTheme, mediaQueryNoHover } = Object.keys(colors).reduce((acc, name) => {
    let currentColor;
    let mediaQueryNoHover = '';
    let fullColorTheme = '';
    if (name === 'GREY') {
      currentColor = colors.GREY;
      const textShade = 800;

      mediaQueryNoHover = `
        &[data-color="grey"] {
          ${assignOverlayHoverColor('background-color', 'transparent')}
          ${assignOverlayActiveColor('background-color', getColor(currentColor, 900, 0.15))}
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

      mediaQueryNoHover = `
        &[data-color="${colorName}"] {
          ${assignOverlayHoverColor('background-color', 'transparent')}
          ${assignOverlayActiveColor('background-color', getColor(currentColor, 500, 0.15))}
        }
      `;

      fullColorTheme = `
        &[data-color="${colorName}"] {
          color: ${getColor(currentColor)};
          
          ${assignOverlayColor('background-color', 'transparent')}
          ${assignOverlayHoverColor('background-color', getColor(currentColor, 500, 0.08))}
          ${assignOverlayActiveColor('background-color', getColor(currentColor, 500, 0.15))}
          
          &[disabled] {
            color: ${getColor(currentColor, 0.6)};
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
    
    @media (hover:none) {
      ${mediaQueryNoHover}
    }
  `;
}

// Default buttons do not apply hover or active styles
export function defaultButtonTheming(props) {
  const colors = props.theme.colors;

  const fullColorTheme = Object.keys(colors).reduce((acc, name) => {
    let fullColorTheme = '';

    if (name === 'GREY') {
      const textShade = 800;
      fullColorTheme = `
        &[data-color="grey"] {
          color: ${getColor(colors.GREY, textShade)};
          
          &[disabled] {
            color: ${getColor(colors.GREY, textShade, 0.6)};
          }
        }
      `;
    } else {
      const currentColor = colors[name];
      const colorName = name.toLowerCase();

      fullColorTheme = `
        &[data-color="${colorName}"] {
          color: ${getColor(currentColor)};
          
          &[disabled] {
            color: ${getColor(currentColor, 0.6)};
          }
        }
      `;
    }

    return acc + fullColorTheme;
  }, '');

  return css`
    ${fullColorTheme}
  `;
}
