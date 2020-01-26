import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { usePlatform } from '../Platform';

export const CUSTOM_AUTOSIZE_EVENT = 'sui:autosize-resize';
/**
 * Hook to automatically resize a textarea to fit its content.
 * @param el {HTMLTextAreaElement}
 * @param options
 */
export function useAutosize(el, options) {
  const {
    value,
    autosizeMinRows: __minRows,
    autosizeMaxRows: __maxRows,
    autosizeEnabled: enabled,
  } = options;

  const is = usePlatform();

  const minRows = React.useMemo(() => __minRows || 0, [__minRows]);
  const maxRows = React.useMemo(() => __maxRows || 0, [__maxRows]);

  /**
   * The style height of the text area
   * @type {React.MutableRefObject<string | undefined>}
   */
  const initialHeight = React.useRef(undefined);
  const [style, setStyle] = React.useState({});

  /** Whether the autosize helper still exists */
  const destroyed = React.useRef(false);

  /**
   * Cached height of a textarea with a single row.
   * @type {React.MutableRefObject<?number>}
   */
  const cachedLineHeight = React.useRef(null);

  /**
   * Value of minRows as of last resize. If the minRows has decreased, the
   * height of the textarea needs to be recomputed to reflect the new minimum. The maxHeight
   * does not have the same problem because it does not affect the textarea's scrollHeight.
   */
  const previousMinRows = React.useRef(-1);

  /** Keep track of the previous textarea value to avoid resizing when the value hasn't changed. */
  const previousValue = React.useRef('');

  const setMinHeight = React.useCallback(
    /** Sets the minimum height of the textarea as determined by minRows. */
    () => {
      const minHeight = minRows && cachedLineHeight.current ?
        `${minRows * cachedLineHeight.current}px` : null;

      if (minHeight) {
        setStyle(style => ({ ...style, minHeight }));
      }
    },
    [minRows, setStyle],
  );

  const setMaxHeight = React.useCallback(
    /** Sets the maximum height of the textarea as determined by maxRows. */
    () => {
      const maxHeight = maxRows && cachedLineHeight.current ?
        `${maxRows * cachedLineHeight.current}px` : null;

      if (maxHeight) {
        setStyle(style => ({ ...style, maxHeight }));
      }
    },
    [maxRows, setStyle],
  );

  const cacheTextareaLineHeight = React.useCallback(
    /**
     * Cache the height of a single-row textarea if it has not already been cached.
     *
     * We need to know how large a single "row" of a textarea is in order to apply minRows and
     * maxRows. For the initial version, we will assume that the height of a single line in the
     * textarea does not ever change.
     */
    () => {
      if (!el || cachedLineHeight.current) return;

      /** @type {HTMLTextAreaElement} */
      let textareaClone = el.cloneNode(false);
      textareaClone.rows = 1;

      // Use `position: absolute` so that this doesn't cause a browser layout and use
      // `visibility: hidden` so that nothing is rendered. Clear any other styles that
      // would affect the height.
      textareaClone.style.position = 'absolute';
      textareaClone.style.visibility = 'hidden';
      textareaClone.style.border = 'none';
      textareaClone.style.padding = '0';
      textareaClone.style.height = '';
      textareaClone.style.minHeight = '';
      textareaClone.style.maxHeight = '';

      // In Firefox it happens that textarea elements are always bigger than the specified amount
      // of rows. This is because Firefox tries to add extra space for the horizontal scrollbar.
      // As a workaround that removes the extra space for the scrollbar, we can just set overflow
      // to hidden. This ensures that there is no invalid calculation of the line height.
      // See Firefox bug report: https://bugzilla.mozilla.org/show_bug.cgi?id=33654
      textareaClone.style.overflow = 'hidden';

      el.parentNode.appendChild(textareaClone);
      cachedLineHeight.current = textareaClone.clientHeight;
      el.parentNode.removeChild(textareaClone);

      // Min and max heights have to be re-calculated if the cached line height changes
      setMinHeight();
      setMaxHeight();
    },
    [el, setMinHeight, setMaxHeight],
  );

  const scrollToCaretPosition = React.useCallback(
    /**
     * Scrolls a textarea to the caret position. On Firefox resizing the textarea will
     * prevent it from scrolling to the caret position. We need to re-set the selection
     * in order for it to scroll to the proper position.
     * @param textarea {HTMLTextAreaElement}
     */
    (textarea) => {
      const { selectionStart, selectionEnd } = textarea;
      // IE will throw an "Unspecified error" if we try to set the selection range after the
      // element has been removed from the DOM. Assert that the directive hasn't been destroyed
      // between the time we requested the animation frame and when it was executed.
      // Also note that we have to assert that the textarea is focused before we set the
      // selection range. Setting the selection range on a non-focused textarea will cause
      // it to receive focus on IE and Edge.
      if (!destroyed.current && document.activeElement === textarea) {
        textarea.setSelectionRange(selectionStart, selectionEnd);
      }
    },
    [],
  );

  const resizeToFitContent = React.useCallback(
    /**
     * Resize the textarea to fit its content.
     * @param force {boolean} Whether to force a height recalculation. By default the height
     * will be recalculated only if the value changed since the last call.
     */
    (force) => {
      if (!enabled) return;

      cacheTextareaLineHeight();

      // If we haven't determined the line-height yet, we know we're still hidden and there's no
      // point in checking the height of the textarea.
      if (!cachedLineHeight.current) return;

      // Only resize if the value or minRows have changed since these calculations can be expensive.
      if (!force && minRows === previousMinRows.current && value === previousValue.current) return;

      const placeholderText = el.placeholder;

      // Adds the property `data-autosize-measuring`
      // Reset the textarea height to auto in order to shrink back to its default size.
      // Also temporarily force overflow:hidden, so scroll bars do not interfere with calculations.
      // Long placeholders that are wider than the textarea width may lead to a bigger scrollHeight
      // value. To ensure that the scrollHeight is not bigger than the content, the placeholders
      // need to be removed temporarily.
      el.dataset.autosizeMeasuring = 'true';
      el.placeholder = '';

      const height = el.scrollHeight - 4;

      setStyle(style => ({ ...style, height: `${height}px` }));

      delete el.dataset.autosizeMeasuring;
      el.placeholder = placeholderText;

      if (typeof window.requestAnimationFrame !== 'undefined') {
        window.requestAnimationFrame(() => scrollToCaretPosition(el));
      } else {
        window.setTimeout(() => scrollToCaretPosition(el), 0);
      }

      previousValue.current = value;
      previousMinRows.current = minRows;
    },
    [el, value, enabled, minRows, cacheTextareaLineHeight, setStyle, scrollToCaretPosition]
  );

  const reset = React.useCallback(
    /**
     * Resets the textarea to its original size
     */
    () => {
      // Do not try to change the textarea, if the initialHeight has not been determined yet
      // This might potentially remove styles when reset() is called before ngAfterViewInit
      if (initialHeight.current === undefined) return;

      setStyle(style => ({ ...style, height: initialHeight.current }));
    },
    [setStyle],
  );

  const onWindowResize = React.useCallback(() => {
    resizeToFitContent(true);
    window.dispatchEvent(new Event(CUSTOM_AUTOSIZE_EVENT, { bubbles: true }));
  }, [resizeToFitContent]);

  React.useEffect(() => {
    if (enabled) {
      resizeToFitContent(true);
    } else {
      reset();
    }
  }, [enabled, resizeToFitContent, reset]);

  React.useEffect(() => {
    setMinHeight();
  }, [minRows]);

  React.useEffect(() => {
    setMaxHeight();
  }, [maxRows]);

  React.useEffect(() => {
    const listener = debounce(onWindowResize, 16);
    if (is('browser') && el) {
      // Remember the height we started with in case autosizing is disabled
      initialHeight.current = el.style.height;

      resizeToFitContent();

      window.addEventListener('resize', listener);
    }

    return () => {
      if (el) {
        window.removeEventListener('resize', listener);
      }
    };
  }, [is('browser'), el, onWindowResize]);

  React.useEffect(() => {
    return () => {
      destroyed.current = true;
    }
  }, []);

  return { rows: 1, style, 'data-autosize': enabled };
}

useAutosize.propTypes = {
  autosizeMinRows: PropTypes.number,
  autosizeMaxRows: PropTypes.number,
  autosizeEnabled: PropTypes.bool,
};

useAutosize.defaultProps = {
  autosizeEnabled: false,
  autosizeMinRows: 1,
  autosizeMaxRows: 1,
};
