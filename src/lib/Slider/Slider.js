import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { normalizePassiveListenerOptions } from '../../cdk/Platform';
import {
  SliderFocusRing,
  SliderRoot, SliderThumb, SliderThumbContainer, SliderThumbLabel, SliderThumbLabelText, SliderTicks,
  SliderTicksContainer,
  SliderTrackBackground,
  SliderTrackFill,
  SliderTrackWrapper,
  SliderWrapper,
} from './styles';
import { useTabIndex } from '../core/common/useTabIndex';
import { clamp, getPointerPositionOnPage, isTouchEvent } from './util';

/**
 * @typedef {Object} SliderChangeEvent
 * @property source {EventTarget}
 * @property value {number | null}
 */

/**
 * Visually, a 30px separation between tick marks looks best. This is very subjective but it is
 * the default separation we chose.
 */
const MIN_AUTO_TICK_SEPARATION = 30;

let nextUniqueId = 0;

const activeEventOptions = normalizePassiveListenerOptions({ passive: false });

function Slider(props) {
  const {
    id, min, max, value, vertical, tickInterval, tabIndex: __tabIndex, disabled, step,
    onChange, ...restProps
  } = props;
  /** Refs */
  /** @type {React.MutableRefObject<HTMLElement>} Root element */
  const element = React.useRef(null);

  /** @type {React.MutableRefObject<HTMLElement>} Slider wrapper */
  const sliderWrapper = React.useRef(null);

  /** @type {React.MutableRefObject<ClientRect | null>} Dimensions of the slider */
  const sliderDimensions = React.useRef(null);

  /**
   * Keeps track of the last pointer event that was captured by the slider.
   * @type {React.MutableRefObject<MouseEvent | TouchEvent | null>}
   */
  const lastPointerEvent = React.useRef(null);

  /**
   * Decimal places to round to, based on the step amount.
   * @type {React.MutableRefObject<number | null>}
   */
  const roundToDecimal = React.useRef(null);

  /** Whether the component is sliding right now */
  const [isSliding, setIsSliding] = React.useState(false);

  /** The size of a tick interval as a percentage of the size of the track. */
  const [tickIntervalPercent, setTickIntervalPercent] = React.useState(0);

  /** @type {number} Tab index from combined tab index and disabled */
  const tabIndex = useTabIndex(__tabIndex, disabled);

  /**
   * Callbacks
   */
  /** Blurs the native element. */
  const blurHostElement = React.useCallback(() => {
    element.current.blur();
  }, []);

  /** @type {function} */
  const focusHostElement = React.useCallback(
    /**
     * Focuses the native element.
     * Currently only used to allow a blur event to fire but will be used with keyboard input later.
     * @param [options] {FocusOptions}
     */
    (options) => {
      element.current.focus(options);
    },
    [],
  );

  /** @type {function(): ClientRect | DOMRect | null} */
  const getSliderDimensions = React.useCallback(
    /**
     * Get the bounding client rect of the slider track element.
     * The track is used rather than the native element to ignore the extra space that the thumb can
     * take up.
     * @return {ClientRect | DOMRect | null}
     */
    () => (
      sliderWrapper.current ? sliderWrapper.current.getBoundingClientRect() : null
    ),
    [],
  );

  /** @type {function(percentage: number): number} */
  const calculateSliderValue = React.useCallback(
    /**
     * Calculate the value a percentage corresponds to.
     * @param percentage {number}
     * @return {number}
     */
    (percentage) => {
      return min + percentage * (max - min);
    },
    [min, max],
  );

  /** @type {function(value: number): number} */
  const calculateSliderPercentage = React.useCallback(
    /**
     * Calculate the percentage the value corresponds to.
     * @param value {number}
     * @return {number}
     */
    (value) => {
      return ((value || 0) - min) / (max - min);
    },
    [min, max],
  );

  /** Calculated percentage */
  const percent = React.useMemo(() => {
    const basePercentage = calculateSliderPercentage(value);
    return clamp(basePercentage);
  }, [calculateSliderPercentage, min, max, value]);

  const createChangeEvent = React.useCallback(
    /**
     * Creates a slider change object from the specified value.
     * @param value {number}
     * @return {SliderChangeEvent}
     */
    (value) => {
      return { source: element.current, value };
    },
    [],
  );

  /** @type {function(): void} */
  const updateTickIntervalPercent = React.useCallback(
    /**
     * Updates the amount of space between ticks as a percentage of the width of the slider.
     */
    () => {
      if (!tickInterval || !sliderDimensions.current) return;

      if (tickInterval === 'auto') {
        const trackSize = vertical ?
          sliderDimensions.current.height :
          sliderDimensions.current.width;
        const pixelsPerStep = trackSize * step / (max - min);
        const stepsPerTick = Math.ceil(MIN_AUTO_TICK_SEPARATION / pixelsPerStep);
        const pixelsPerTick = stepsPerTick * step;
        setTickIntervalPercent(pixelsPerTick / trackSize);
      } else {
        setTickIntervalPercent(tickInterval * step / (max - min));
      }
    },
    [tickInterval, setTickIntervalPercent, vertical, step, max, min],
  );

  /** @type {function(pos: { x: number, y: number }): void} */
  const updateValueFromPosition = React.useCallback(
    /**
     * Calculate the new value from the new physical location. The value will always be snapped.
     * @param {{ x: number, y: number }} pos
     */
    (pos) => {
      if (!sliderDimensions.current) return;

      const offset = vertical ? sliderDimensions.current.top : sliderDimensions.current.left;
      const size = vertical ? sliderDimensions.current.height : sliderDimensions.current.width;
      const posComponent = vertical ? pos.y : pos.x;

      // The exact value is calculated from the event and used to find the closest snap value.
      let percent = clamp((posComponent - offset) / size);

      if (shouldInvertMouseCoords) {
        percent = 1 - percent;
      }

      // Since the steps may not divide cleanly into the max value, if the user
      // slid to 0 or 100 percent, we jump to the min/max value. This approach
      // is slightly more intuitive than using `Math.ceil` below, because it
      // follows the user's pointer closer.
      if (percent === 0) {
        onChange(createChangeEvent(min));
      } else if (percent === 1) {
        onChange(createChangeEvent(max));
      } else {
        const exactValue = calculateSliderValue(percent);

        // This calculation finds the closest step by finding the closest
        // whole number divisible by the step relative to the min.
        const closestValue = Math.round((exactValue - min) / step) * step + min;

        // The value needs to snap to the min and max.
        onChange(createChangeEvent(clamp(closestValue, min, max)));
      }
    },
    [calculateSliderValue, createChangeEvent, onChange, vertical, min, step],
  );

  /** @type {function(numSteps: number): void} */
  const increment = React.useCallback(
    /**
     * Increments the slider by the given number of steps (negative number decrements).
     * @param numSteps {number}
     */
    (numSteps) => {
      const newValue = clamp((value || 0) + step * numSteps, min, max);
      onChange(createChangeEvent(newValue));
    },
    [onChange, createChangeEvent, value, step, min, max],
  );

  /** @type {function(event: TouchEvent | MouseEvent): void} */
  const pointerDown = React.useCallback(
    /**
     * Called when the user has put their pointer down on the slider.
     * @param event {TouchEvent | MouseEvent}
     */
    (event) => {
      // Don't do anything if the slider is disabled or the
      // user is using anything other than the main mouse button.
      if (disabled || isSliding || (!isTouchEvent(event) && event.button !== 0)) {
        return;
      }

      const pointerPosition = getPointerPositionOnPage(event);
      setIsSliding(true);
      lastPointerEvent.current = event;
      event.preventDefault();
      focusHostElement();
      onMouseEnter(); // Simulate in case it's a mobile device
      bindGlobalEvents(event);
      focusHostElement();
      updateValueFromPosition(pointerPosition);
      valueOnSlideStart.current = value;
      pointerPositionOnStart.current = pointerPosition;
    },
    [
      disabled, setIsSliding, isSliding, focusHostElement, onMouseEnter, bindGlobalEvents,
      updateValueFromPosition,
    ],
  );

  /** @type {function(event: TouchEvent | MouseEvent): void} */
  const pointerMove = React.useCallback(
    /**
     * Called when the user has moved their pointer after
     * starting to drag. Bound on the document level.
     * @param event {TouchEvent | MouseEvent}
     */
    (event) => {
      if (isSliding) {
        // Prevent the slide from selecting anything else
        event.preventDefault();
        lastPointerEvent.current = event;
        updateValueFromPosition(getPointerPositionOnPage(event));
      }
    },
    [isSliding, updateValueFromPosition],
  );

  /** @type {function(event: TouchEvent | MouseEvent): void} */
  const pointerUp = React.useCallback(
    /**
     * Called when the user has lifted their pointer. Bound on the document level.
     * @param event {TouchEvent | MouseEvent}
     */
    (event) => {
      if (isSliding) {
        const __pointerPositionOnStart = pointerPositionOnStart.current;
        const currentPointerPosition = getPointerPositionOnPage(event);

        event.preventDefault();

        removeGlobalEvents();

        valueOnSlideStart.current = pointerPositionOnStart.current =
          lastPointerEvent.current = null;
        setIsSliding(false);

      }
    },
    [isSliding, removeGlobalEvents],
  );

  /** Called when the window has lost focus. */
  const windowBlur = React.useCallback(() => {
    // If the window is blurred while dragging we need to stop dragging because the
    // browser won't dispatch the `mouseup` and `touchend` events anymore.
    if (lastPointerEvent.current) {
      pointerUp(lastPointerEvent.current);
    }
  }, [pointerUp]);

  /** Removes any global event listeners that we may have added. */
  const removeGlobalEvents = React.useCallback(() => {
    if (typeof document !== 'undefined' && document) {
      const body = document.body;
      body.removeEventListener('mousemove', pointerMove, activeEventOptions);
      body.removeEventListener('mouseup', pointerUp, activeEventOptions);
      body.removeEventListener('touchmove', pointerMove, activeEventOptions);
      body.removeEventListener('touchend', pointerUp, activeEventOptions);
      body.removeEventListener('touchcancel', pointerUp, activeEventOptions);
    }

    if (typeof window !== 'undefined' && window) {
      window.removeEventListener('blur', windowBlur);
    }
  }, [pointerMove, pointerUp, windowBlur]);

  /** @type {function(triggerEvent: TouchEvent | MouseEvent): void} */
  const bindGlobalEvents = React.useCallback(
    /**
     * Binds our global move and end events. They're bound at the document level and only while
     * dragging so that the user doesn't have to keep their pointer exactly over the slider
     * as they're swiping across the screen.
     * @param triggerEvent {TouchEvent | MouseEvent}
     */
    (triggerEvent) => {
      if (typeof document !== 'undefined' && document) {
        const body = document.body;
        const isTouch = isTouchEvent(triggerEvent);

        const moveEventName = isTouch ? 'touchmove' : 'mousemove';
        const endEventName = isTouch ? 'touchend' : 'mouseup';

        body.addEventListener(moveEventName, pointerMove, activeEventOptions);
        body.addEventListener(endEventName, pointerUp, activeEventOptions);

        if (isTouch) {
          body.addEventListener('touchcancel', pointerUp, activeEventOptions);
        }
      }

      if (typeof window !== 'undefined' && window) {
        window.addEventListener('blur', windowBlur);
      }
    },
    [pointerMove, pointerUp, windowBlur],
  );

  const onSelectStart = React.useCallback(
    (event) => {
      event.preventDefault();
      if (typeof restProps.onSelectStart === 'function') {
        restProps.onSelectStart(event);
      }
    },
    [restProps.onSelectStart],
  );

  const trackBackgroundStyles = React.useMemo(() => {
    const axis = vertical ? 'translateY' : 'translateX';
    const scale = vertical ?
      `1, ${1 - percent}, 1` :
      `${1 - percent}, 1, 1`;
    const sign = shouldInvertMouseCoords ? '-' : '';

    return {
      transform: `${axis}(${sign}${thumbGap}px) scale3d(${scale})`,
    };
  }, [vertical, percent, shouldInvertMouseCoords, thumbGap]);

  /**
   * Change detection
   */
  React.useEffect(() => {
    if (step % 1 !== 0) {
      roundToDecimal.current = (step.toString().split('.').pop() || '').length;
    }
  }, [step]);

  return (
    <SliderRoot
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onMouseEnter={onMouseEnter}
      onSelectStart={onSelectStart}
      role="slider"
      tabIndex={tabIndex}
      aria-disabled={disabled}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={value}
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      data-disabled={disabled}
      data-has-ticks={tickInterval}
      data-horizontal={!vertical}
      data-axis-inverted={invertAxis}
      data-is-sliding={isSliding}
      ref={element}
    >
      <SliderWrapper ref={sliderWrapper}>
        <SliderTrackWrapper>
          <SliderTrackBackground style={trackBackgroundStyles} />
          <SliderTrackFill style={trackFillStyles} />
        </SliderTrackWrapper>
        <SliderTicksContainer style={ticksContainerStyles}>
          <SliderTicks style={ticksStyles} />
        </SliderTicksContainer>
        <SliderThumbContainer style={thumbContainerStyles}>
          <SliderFocusRing />
          <SliderThumb />
          <SliderThumbLabel>
            <SliderThumbLabelText as="span">{ displayValue }</SliderThumbLabelText>
          </SliderThumbLabel>
        </SliderThumbContainer>
      </SliderWrapper>
    </SliderRoot>
  );
}

Slider.propTypes = {
  id: PropTypes.string,
  /**
   * How often to show ticks. Relative to the step so that a tick always appears on a step.
   * Ex: Tick interval of 4 with a step of 3 will draw a tick every 4 steps (every 12 values).
   */
  tickInterval: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
  /** Value of the slider. */
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Corresponding onChange callback */
  onChange: PropTypes.func,
  /** The minimum value that the slider can have. */
  min: PropTypes.number,
  /** The maximum value that the slider can have. */
  max: PropTypes.number,
  /** Whether the slider is vertical. */
  vertical: PropTypes.bool,
  /** The values at which the thumb will snap. */
  step: PropTypes.number,
};

Slider.defaultProps = {
  id: null,
  tickInterval: 0,
  value: null,
  onChange: noop,
  vertical: false,
  step: 1,
};
