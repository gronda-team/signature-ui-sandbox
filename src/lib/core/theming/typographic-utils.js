/**
 * Utility functions for styled helpers.
 */
import { css } from 'styled-components';
import _ from 'lodash';

export const convertPropertiesToShorthand = ({
  fontSize, fontWeight, lineHeight, fontFamily
}) => {
  if (
    _.some(
      { fontSize, fontWeight, lineHeight, fontFamily },
        property => property === null || property === 'inherit')
  ) {
    /**
     * If any of the values are set to `inherit`, then we can't use the `font: ...`
     * shorthand property. We have to set them all individually.
     */
    return css`
    font-size: ${fontSize};
    line-height: ${lineHeight};
    font-weight: ${fontWeight};
    font-family: ${fontFamily};
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

/** Get property value for the theme */
export const getPropertyValue = (config, level, property) => (
  _.get(config, [level, property])
);

/** Get the font family from the typography config */
export const getFontFamily = (config, level = null) => {
  let fontFamily = _.get(config, 'fontFamily');

  if (!_.isNil(level)) {
    fontFamily = _.get(config, [level, 'fontFamily']);
  }

  return fontFamily;
};

/** Get the line height */
export const getLineHeight = (config, level) => (
  getPropertyValue(config, level, 'lineHeight')
);

/** Get the font size */
export const getFontSize = (config, level) => (
  getPropertyValue(config, level, 'fontSize')
);

/** Get the font size */
export const getFontWeight = (config, level) => (
  getPropertyValue(config, level, 'fontWeight')
);
