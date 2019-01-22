import _ from 'lodash';
/** Coerces a value to a CSS pixel value. */
export function coerceCssPixelValue(value) {
  if (_.isNil(value)) {
    return '';
  }
  
  return typeof value === 'string' ? value : `${value}px`;
}
