import _ from 'lodash';
/** Returns the viewport's width and height. */
export function getViewportSize() {
  if (_.isUndefined(window)) {
    return { width: 0, height: 0 };
  }
  
  return { width: window.innerWidth, height: window.innerHeight };
}
