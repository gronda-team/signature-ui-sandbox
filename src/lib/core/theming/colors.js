import Color from 'color';
import { CHERRY, ROYAL_BLUE, TEAL } from '../../../cdk/theme/colors';

/**
 * Generate a color map, i.e., one that has a base color, and lighter/darker versions of
 * those colors.
 *
 * @param colorMap { Object } Map given by the colors in the theme file
 * @param base { number } Swatch number corresponding to the default color
 * @param lighter { number } Swatch number corresponding to the lighter color
 * @param darker { number } Swatch number corresponding to the darker color
 * @returns {{default: string, darker: string, lighter: string}}
 */
export function generatePalette(colorMap, base = 500, lighter = 300, darker = 700) {
  return {
    default: colorMap[base],
    lighter: colorMap[lighter],
    darker: colorMap[darker],
  };
}

/**
 * Gets a color from a theme palette (the output of mat-palette).
 * The hue can be one of the standard values (500, A400, etc.), one of the three preconfigured
 * hues (default, lighter, darker), or any of the aforementioned prefixed with "-contrast".
 *
 * @param palette The theme palette (output of mat-palette).
 * @param hue The hue from the palette to use. If this is a value between 0 and 1, it will
 * be treated as opacity.
 * @param [opacity] { number } The alpha channel value for the color.
 */
export function getColor(palette, hue, opacity) {
  /**
   * If hueKey is a number between zero and one, then it actually contains an
   * opacity value, so recall this function with the default hue and that given opacity.
   */
  if (_.isNumber(hue) && hue >= 0 && hue <= 1) {
    return getColor(palette, 'default', hue);
  }

  let color = _.get(palette, hue);
  try {
    /** Coerce the color string into a JS value */
    color = Color(color);
  } catch (error) {
    /** If it somehow errs, then we should just return the value itself */
    console.error(error);
    return _.get(palette, hue);
  }

  if (_.isNil(opacity)) {
    return color.rgba().fade(color.alpha());
  }

  return color.rgba().fade(opacity);
}

/**
 * Create a theme based on `generatePalette` colors.
 */
export function generateThemeColors(primary, accent, warn = generatePalette(CHERRY)) {
  return {
    primary,
    accent,
    warn,
  };
}

export const DEFAULT_THEME_CONFIG = generateThemeColors(
  generatePalette(TEAL),
  generatePalette(ROYAL_BLUE),
);
