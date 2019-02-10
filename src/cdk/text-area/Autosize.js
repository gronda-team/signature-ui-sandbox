import * as React from 'react';
import _ from 'lodash';
import { withPlatformConsumer, PlatformDefaultProps, PlatformPropTypes } from '../platform';

class TextAreaAutosize extends React.Component {
  constructor() {
    super();
    
    this.state = {
      /** Keep track of the previous textarea value to avoid resizing when the value hasn't changed. */
      previousValue: '',
      initialHeight: null,
      /** Minimum number of rows in the textarea. */
      minRows: null,
      /**
       * Value of minRows as of last resize. If the minRows has decreased, the
       * height of the textarea needs to be recomputed to reflect the new minimum. The maxHeight
       * does not have the same problem because it does not affect the textarea's scrollHeight.
       */
      previousMinRows: -1,
      /** Maximum number of rows in the textarea. */
      maxRows: null,
      /** Whether autosizing is enabled or not */
      enabled: true,
      textAreaElement: null, // HTMLTextAreaElement
      /** Cached height of a textarea with a single row. */
      cachedLineHeight: null,
      /** Consumable heights for the TextArea component */
      minHeight: null,
      maxHeight: null,
      /** Consumed by the TextArea component */
      provide: {
        height: null,
        setRows: this.setRows,
        setElement: this.setElement,
      },
    };
    
    this.resizeListener = _.debounce(_.partial(this.resizeToFitContent, true));
  }
  
  /**
   * Lifecycle
   */
  componentDidUpdate(prevProps, prevState) {
    // listen to when we first have state.textArea
    if (!prevState.textAreaElement && this.state.textAreaElement) {
      storeInitialHeight.call(this);
      this.resizeToFitContent();
    }
    
    if (prevState.minRows !== this.state.minRows) {
      this.setMinHeight();
    }
    
    if (prevState.maxRows !== this.state.maxRows) {
      this.setMaxHeight();
    }
    
    if (prevState.enabled !== this.state.enabled) {
      if (this.state.enabled) {
        // previously disable -> now enabled
        this.resizeToFitContent(true);
      } else {
        this.reset();
      }
    }
  }
  
  componentWillUnmount() {
    if (this.props.__platform.is('browser')) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }
  
  /**
   * Actions
   */
  /** Privately set the number of rows that are used */
  setRows = ({ min, max }) => {
    this.setState({ minRows: min, maxRows: max });
  };
  
  /** Sets the minimum height of the textarea as determined by minRows. */
  setMinHeight = () => {
    const minHeight = this.state.minRows && this.state.cachedLineHeight ?
      `${this.state.minRows * this.state.cachedLineHeight}px` : null;
  
    if (minHeight) {
      this.setState({ minHeight });
    }
  };
  
  /** Sets the maximum height of the textarea as determined by maxRows. */
  setMaxHeight = () => {
    const maxHeight = this.state.maxRows && this.state.cachedLineHeight ?
      `${this.state.maxRows * this.state.cachedLineHeight}px` : null;
  
    if (maxHeight) {
      this.setState({ maxHeight });
    }
  };
  
  resizeToFitContent = (force = false) => {
    if (!this.state.enabled) return;
    cacheTextAreaLineHeight.call(this);
    
    if (!this.state.cachedLineHeight) return;
    
    const textArea = this.state.textAreaElement;
    const value = textArea.value;
    // Only resize if the value or minRows have changed since these calculations can be expensive.
    if (
      !force && this.state.minRows === this.state.previousMinRows
      && value === this.state.previousValue
    ) return;
    
    const placeholderText = textArea.placeholder;
  
    // Reset the textarea height to auto in order to shrink back to its default size.
    // Also temporarily force overflow:hidden, so scroll bars do not interfere with calculations.
    // Long placeholders that are wider than the textarea width may lead to a bigger scrollHeight
    // value. To ensure that the scrollHeight is not bigger than the content, the placeholders
    // need to be removed temporarily.
    const existingStyle = textArea.style.cssText;
    
    // This class is temporarily applied to the textarea when it is being measured. It is immediately
    // removed when measuring is complete. We use `!important` rules here to make sure user-specified
    // rules do not interfere with the measurement.
    textArea.style.cssText += `
    height: auto !important;
    overflow: hidden !important;
    // Having 2px top and bottom padding seems to fix a bug where Chrome gets an incorrect
    // measurement. We just have to account for it later and subtract it off the final result.
    padding: 2px 0 !important;
    box-sizing: content-box !important;
    `;
    textArea.placeholder = '';
  
    // The cdk-textarea-autosize-measuring class includes a 2px padding to workaround an issue with
    // Chrome, so we account for that extra space here by subtracting 4 (2px top + 2px bottom).
    const height = textArea.scrollHeight - 4;
    // Set style manually since we don't want these secret changes
    // to appear on the next paint
    textArea.style.cssText = existingStyle;
    
    textArea.placeholder = placeholderText;
  
    // On Firefox resizing the textarea will prevent it from scrolling to the caret position.
    // We need to re-set the selection in order for it to scroll to the proper position.
    if (!_.isUndefined(window.requestAnimationFrame)) {
      window.requestAnimationFrame(() => {
        const { selectionStart, selectionEnd } = textArea;
  
        // IE will throw an "Unspecified error" if we try to set the selection range after the
        // element has been removed from the DOM. Assert that the directive hasn't been destroyed
        // between the time we requested the animation frame and when it was executed.
        // Also note that we have to assert that the textarea is focused before we set the
        // selection range. Setting the selection range on a non-focused textarea will cause
        // it to receive focus on IE and Edge.
        if (document.activeElement === textArea) {
          textArea.setSelectionRange(selectionStart, selectionEnd);
        }
      });
    }
    
    this.setState(state => ({
      previousValue: value,
      previousMinRows: state.minRows,
      provide: {
        ...state.provide,
        height: `${height}px`,
      },
    }));
  };
  
  /** Reset the textArea to its original size */
  reset = () => {
    if (_.isUndefined(this.state.initialHeight)) return;
    
    this.setState(state => ({
      provide: { ...state.provide, height: state.initialHeight },
    }))
  };
}

TextAreaAutosize.propTypes = {
  __platform: PlatformPropTypes,
};

TextAreaAutosize.defaultProps = {
  __platform: PlatformDefaultProps,
};

/**
 * Private methods
 */
function storeInitialHeight() {
  if (this.props.__platform.is('browser')) {
    // Remember the height which we started with in case autosizing is disabled
    this.setState({ initialHeight: this.state.textAreaElement.style.height }, () => {
      this.resizeToFitContent();
      window.addEventListener('resize', this.resizeListener);
    });
  }
}

/**
 * Cache the height of a single-row textarea if it has not already been cached.
 *
 * We need to know how large a single "row" of a textarea is in order to apply minRows and
 * maxRows. For the initial version, we will assume that the height of a single line in the
 * textarea does not ever change.
 */
function cacheTextAreaLineHeight() {
  if (this.state.cachedLineHeight) return;
  
  // Use a clone element because we have to override some styles.
  const textAreaClone = this.state.textAreaElement.cloneNode(false);
  textAreaClone.rows = 1;
  
  // Use `position: absolute` so that this doesn't cause a browser layout and use
  // `visibility: hidden` so that nothing is rendered. Clear any other styles that
  // would affect the height.
  textAreaClone.style.position = 'absolute';
  textAreaClone.style.visibility = 'hidden';
  textAreaClone.style.border = 'none';
  textAreaClone.style.padding = '0';
  textAreaClone.style.height = '';
  textAreaClone.style.minHeight = '';
  textAreaClone.style.maxHeight = '';
  
  // In Firefox it happens that textarea elements are always bigger than the specified amount
  // of rows. This is because Firefox tries to add extra space for the horizontal scrollbar.
  // As a workaround that removes the extra space for the scrollbar, we can just set overflow
  // to hidden. This ensures that there is no invalid calculation of the line height.
  // See Firefox bug report: https://bugzilla.mozilla.org/show_bug.cgi?id=33654
  textAreaClone.style.overflow = 'hidden';
  
  
  // append ghost node
  this.textAreaElement.parentNode.appendChild(textAreaClone);
  this.setState({ cachedLineHeight: textAreaClone.clientHeight });
  // remove ghost node after caching line height
  this.textAreaElement.parentNode.removeChild(textAreaClone);
  
  // Min and max heights have to be re-calculated if the cached line height changes
  this.setMinHeight();
  this.setMaxHeight();
}

const StackedTextAreaAutosize = withPlatformConsumer(TextAreaAutosize);

export default StackedTextAreaAutosize;
