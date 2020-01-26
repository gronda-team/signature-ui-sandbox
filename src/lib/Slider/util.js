import __clamp from 'lodash/clamp';

/**
 * Returns whether an event is a touch event.
 * @param event {MouseEvent | TouchEvent}
 * @return {boolean}
 */
export function isTouchEvent(event) {
  // This function is called for every pixel that the user has dragged so we need it to be
  // as fast as possible. Since we only bind mouse events and touch events, we can assume
  // that if the event's name starts with `t`, it's a touch event.
  return event.type[0] === 't';
}

/**
 * Gets the coordinates of a touch or mouse event relative to the viewport.
 * @param event {MouseEvent | TouchEvent}
 * @return {{ x: number, y: number }}
 */
export function getPointerPositionOnPage(event) {
  // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
  const point = isTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
  return { x: point.clientX, y: point.clientY };
}

/**
 * Return a number between two numbers.
 * @param value {number}
 * @param min {number}
 * @param max {number}
 * @return {number}
 */
export function clamp(value, min = 0, max = 1) {
  return __clamp(value, min, max);
}
