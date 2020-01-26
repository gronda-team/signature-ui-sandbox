/**
 * Splits an svgIcon binding value into its icon set and icon name components.
 * Returns a 2-element array of [(icon set), (icon name)].
 * The separator for the two fields is ':'. If there is no separator, an empty
 * string is returned for the icon set and the entire value is returned for
 * the icon name. If the argument is falsy, returns an array of two empty strings.
 * Throws an error if the name contains two or more ':' separators.
 * Examples:
 *   `'social:cake' -> ['social', 'cake']
 *   'penguin' -> ['', 'penguin']
 *   null -> ['', '']
 *   'a:b:c' -> (throws Error)`
 * @param iconName {string}
 * @return {string[]}
 */
export function splitIconName(iconName) {
  if (!iconName) return ['', ''];

  const parts = iconName.split(':');

  switch (parts.length) {
    case 1: return ['', parts[0]];
    case 2: return parts;
    default: throw new Error('Invalid icon name: "' + iconName + '"');
  }
}

/**
 * Returns the cache key to use for an icon namespace and name.
 * @param namespace {string}
 * @param name {string}
 * @return {string}
 */
export function iconKey(namespace, name) {
  return `${namespace}:${name}`;
}

/**
 * Clones an SVGElement while preserving type information.
 * @param {SVGElement} svg
 * @return SVGElement
 */
export function cloneSvg(svg) {
  return svg.cloneNode(true);
}

/**
 * Cleans up a font value used as a fontIcon or fontSet.
 * We have to trim it and omit the spaces for it to be a recognized CSS class.
 * @param value {string}
 * @return {string}
 */
export function cleanupFontValue(value) {
  return typeof value === 'string' ? value.trim().split(' ')[0] : value;
}
