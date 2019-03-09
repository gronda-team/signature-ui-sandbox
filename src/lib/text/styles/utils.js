/**
 * Utility functions for styled helpers.
 */
import { css } from 'styled-components';

export const convertPropertiesToShorthand = ({
  fontSize, fontWeight, lineHeight, fontFamily
}) => {
  if (_.some(arguments[0], property => property === null || property === 'inherit')) {
    /**
     * If any of the values are set to `inherit`, then we can't use the `font: ...`
     * shorthand property. We have to set them all individually.
     */
    return css`
    font-size: ${fontSize};
    line-height: ${lineHeight};
    font-weight: ${fontWeight};
    ${fontFamily ? `font-family: ${fontFamily};` : ''}
    `;
  } else {
    return css`font: ${fontWeight} ${fontSize}/${lineHeight} ${fontFamily};`;
  }
};

/**
 * Convert the style object into CSS style using styled-components `css` method.
 */
export const convertLevelToStyles = (config, level) => {
  const { fontSize, fontWeight, lineHeight, fontFamily, letterSpacing } = _.get(config, level);

  const font = convertPropertiesToShorthand({ fontSize, fontWeight, lineHeight, fontFamily });

  return css`
  ${font}
  letter-spacing: ${letterSpacing};
  `;
};
