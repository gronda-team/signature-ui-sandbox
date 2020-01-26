/**
 * @param length {number}
 * @param overflows {...number}
 * @return {number}
 */
export function subtractOverflows(length, ...overflows) {
  return overflows.reduce((currentValue, currentOverflow) => (
    currentValue - Math.max(currentOverflow, 0)
  ), length);
}

/**
 * Gets whether an element is clipped by any of its scrolling containers.
 * @param element {ClientRect} Dimensions of the element (from getBoundingClientRect)
 * @param scrollContainers {ClientRect[]} Dimensions of element's scrolling containers (from
 * getBoundingClientRect)
 * @returns {boolean} Whether the element is clipped
 */
export function isElementClippedByScrolling(element, scrollContainers) {
  return scrollContainers.some(scrollContainerRect => {
    const clippedAbove = element.top < scrollContainerRect.top;
    const clippedBelow = element.bottom > scrollContainerRect.bottom;
    const clippedLeft = element.left < scrollContainerRect.left;
    const clippedRight = element.right > scrollContainerRect.right;

    return clippedAbove || clippedBelow || clippedLeft || clippedRight;
  });
}

/**
 * Gets whether an element is scrolled outside of view by any of its parent scrolling containers.
 * @param element {ClientRect} Dimensions of the element (from getBoundingClientRect)
 * @param scrollContainers {ClientRect[]} Dimensions of element's scrolling containers (from getBoundingClientRect)
 * @returns {boolean} Whether the element is scrolled out of view
 * @docs-private
 */
export function isElementScrolledOutsideView(element, scrollContainers) {
  return scrollContainers.some(containerBounds => {
    const outsideAbove = element.bottom < containerBounds.top;
    const outsideBelow = element.top > containerBounds.bottom;
    const outsideLeft = element.right < containerBounds.left;
    const outsideRight = element.left > containerBounds.right;

    return outsideAbove || outsideBelow || outsideLeft || outsideRight;
  });
}

// Testing functions
export const utils = {
  noop: function noopFn() {},
};
