import Color from 'color';
import { GREY } from './palette';

const WHITE = GREY[50];
const BLACK = GREY[900];

/**
 * Interpolate a value from one range and map it onto another range.
 * @param x {number} Value in starting range
 * @param x1 {number} Start of starting range
 * @param x2 {number} End of starting range
 * @param y1 {number} Start of target range
 * @param y2 {number} End of target range
 * @return {number} Value in target range
 */
export function interpolate(x, x1, x2, y1, y2) {
  return ((x - x1) * (y2 - y1) / (x2 - x1)) + y1;
}

function interpolateToShade(shade) {
  return interpolate(shade, 0, 900, -1, 1);
}

const whiteColor = Color(WHITE);
const blackColor = Color(BLACK);

/**
 * @param colorOrMap {Object | string}
 * @param [shade] {number | 'default'}
 * @param [opacity] {number}
 */
export function getColor(colorOrMap, shade, opacity = null) {
  // If the shade is a number between zero and one, then it is actually an opacity value, for
  // the default color's shade.
  if (shade == null || (typeof shade === 'number' && shade >= 0 && shade <= 1 && opacity == null)) {
    return getColor(colorOrMap, 'default', shade);
  }

  let targetColor;
  if (typeof colorOrMap === 'string') {
    // If we have the base color (e.g., Bootstrap color), then treat that as the default color
    // because the shades must be calculated.
    const color = Color(colorOrMap);

    // If the shade is a number between 0 and 900, then we want to interpolate it to a shade
    // value.
    if (typeof shade === 'number') {
      const decimalShade = interpolateToShade(shade);
      if (decimalShade > 0) {
        // Correspond to white
        targetColor = color.mix(blackColor, Math.abs(decimalShade))
      } else if (decimalShade < 0) {
        // Correspond to black. We must take the absolute value to mix it with.
        targetColor = color.mix(whiteColor, Math.abs(decimalShade))
      } else {
        // If it's exactly zero, then it's the same as the default color.
        targetColor = color;
      }
    } else {
      targetColor = color;
    }
  } else if (typeof colorOrMap === 'object') {
    // If we have the list of shades already, we do not need to calculate it.
    const shadeNumber = shade === 'default' ? 500 : shade;
    targetColor = Color(colorOrMap[shadeNumber]);
  }

  // Return the color with the opacity baked in.
  return opacity != null ?
    targetColor.alpha(opacity).string() :
    targetColor.string();
}
