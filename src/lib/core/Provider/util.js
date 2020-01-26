import nth from 'lodash/nth';

/**
 * @param propertyValue {string} Property value given from data attribute.
 * @return {string}
 */
export function flipRadius(propertyValue) {
  const radius = propertyValue.split(' ');

  if (radius.length > 4) {
    throw new Error(`Invalid radius: '${radius.toString()}' is more than 4 values.`);
  }

  let result;
  if (radius.length === 4) {
    result = [nth(radius, 1), nth(radius, 0), nth(radius, 3), nth(radius, 2)];
  } else if (radius.length === 3) {
    result = [nth(radius, 1), nth(radius, 0), nth(radius, 1), nth(radius, 2)];
  } else if (radius.length === 2) {
    result = [nth(radius, 1), nth(radius, 0)];
  } else {
    result = radius;
  }

  return result.join(' ');
}
