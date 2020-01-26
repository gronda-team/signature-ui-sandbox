import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { getColor } from '../core/theming/util';

// Dimensions of an icon element
const ICON_SIZE = '24px';

function iconTheme(props) {
  const colors = props.theme.colors;

  const dynamicColorTheme = Object.keys(colors).reduce((acc, name) => {
    if (name === 'GREY') return acc;
    return acc + `
      &[data-color="${name.toLowerCase()}"] {
        color: ${getColor(colors[name])};
      }
    `;
  }, '');

  return css`    
    &[data-color="primary"] {
      color: ${getColor(colors.PRIMARY)};
    }
    
    &[data-color="accent"] {
      color: ${getColor(colors.ACCENT)};
    }
    
    &[data-color="warn"] {
      color: ${getColor(colors.WARN)};
    }
    
    ${dynamicColorTheme}
  `;
}

export const IconRoot = styled.div`
  background-repeat: no-repeat;
  display: inline-block;
  fill: currentColor;
  height: ${ICON_SIZE};
  width: ${ICON_SIZE};
  
  &[data-inline="true"] {
    font-size: inherit;
    height: inherit;
    line-height: inherit;
    width: inherit;
  }
  
  [dir="rtl"] &[data-sui-icon-mirror-rtl="true"] {
    transform: scale(-1, 1);
  }
  
  ${iconTheme}
`;

IconRoot.propTypes = {
  'data-inline': PropTypes.bool,
  'data-sui-icon-mirror-rtl': PropTypes.bool,
  'data-color': PropTypes.string,
};

IconRoot.defaultProps = {
  'data-inline': false,
  'data-sui-icon-mirror-rtl': false,
  'data-color': null,
};
