import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withPlatformConsumer, PlatformDefaultProps, PlatformPropTypes } from '../platform';
import { stack } from '../../lib/core/components/util';
import {
  ExtensionDefaultProps,
  ExtensionPropTypes,
} from '../../lib/form-field/context/ExtensionsContext';

class TextAreaAutosize extends React.Component {
  constructor() {
    super();

    this.state = {
      /** Keep track of the previous textarea value to avoid resizing when the value hasn't changed. */
      previousValue: '',
      initialHeight: null,
      /**
       * Value of minRows as of last resize. If the minRows has decreased, the
       * height of the textarea needs to be recomputed to reflect the new minimum. The maxHeight
       * does not have the same problem because it does not affect the textarea's scrollHeight.
       */
      previousMinRows: -1,
      cachedLineHeight: null,
      /** Consumable heights for the TextArea component */
      minHeight: null,
      maxHeight: null,
    };

    this.STYLE = {};
    this.resizeListener = _.debounce(_.partial(this.resizeToFitContent, true), 16);
  }

  /**
   * Lifecycle
   */
  componentDidMount() {
    this.props.__extensionManager.updateExtensionAttributes('', {
      style: {},
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // listen to when we first have props.input
    if (!prevProps.input && this.props.input) {
      storeInitialHeight.call(this);
      this.resizeToFitContent();
    }

    if (prevProps.minRows !== this.props.minRows) {
      this.setMinHeight();
    }

    if (prevProps.maxRows !== this.props.maxRows) {
      this.setMaxHeight();
    }

    if (prevProps.enabled !== this.props.enabled) {
      if (this.props.enabled) {
        // previously disable -> now enabled
        this.resizeToFitContent(true);
      } else {
        this.reset();
      }
    }

    if (this.props.__platform.is('browser')) {
      this.resizeToFitContent();
    }
  }

  componentWillUnmount() {
    if (this.props.__platform.is('browser')) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  /**
   * Derived data
   */
  /** Get the attributes that have to be placed onto this.props.input */
  getExtendedAttributes = () => ({
    // Textarea elements that have the directive applied should have a single row by default.
    // Browsers normally show two rows by default and therefore this limits the minRows binding.
    rows: 1,
  });

  /**
   * Actions
   */
  /** Sets the minimum height of the textarea as determined by minRows. */
  setMinHeight = () => {
    const minHeight = this.props.minRows && this.state.cachedLineHeight ?
      `${this.props.minRows * this.state.cachedLineHeight}px` : null;

    if (minHeight) {
      this.props.__extensionManager.updateExtensionAttributes('autosize', {
        style: {
          ...this.STYLE,
          minHeight,
        }
      });

      this.STYLE.minHeight = minHeight;
    }
  };

  /** Sets the maximum height of the textarea as determined by maxRows. */
  setMaxHeight = () => {
    const maxHeight = this.props.maxRows && this.state.cachedLineHeight ?
      `${this.props.maxRows * this.state.cachedLineHeight}px` : null;

    if (maxHeight) {
      this.props.__extensionManager.updateExtensionAttributes('autosize', {
        style: {
          ...this.STYLE,
          maxHeight,
        }
      });

      this.STYLE.maxHeight = maxHeight;
    }
  };

  /**
   * Resize the textarea to fit its content.
   * @param force Whether to force a height recalculation. By default the height will be
   *    recalculated only if the value changed since the last call.
   */
  resizeToFitContent = (force = false) => {
    if (!this.props.enabled) return;
    cacheTextAreaLineHeight.call(this);

    if (!this.state.cachedLineHeight) return;

    const textArea = this.props.input;
    const value = textArea.value;
    // Only resize if the value or minRows have changed since these calculations can be expensive.
    if (
      !force && this.props.minRows === this.state.previousMinRows
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
    textArea.style.height = `${height}px`;

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

    this.setState({
      previousValue: value,
      previousMinRows: this.props.minRows,
    });
  };

  /** Reset the textArea to its original size */
  reset = () => {
    // Do not try to change the textarea, if the initialHeight has not been determined yet
    // This might potentially remove styles when reset() is called before ngAfterViewInit
    if (_.isUndefined(this.state.initialHeight)) return;
    this.props.__extensionManager.updateExtensionAttributes('autosize', {
      style: {
        ...this.STYLE,
        height: this.state.initialHeight,
      }
    });
    this.STYLE.height = this.state.initialHeight;
  };

  /**
   * Renderers
   */
  /** No op render */
  render = () => null;
}

const TextAreaAutosizePropTypes = {
  /** Textarea input el */
  input: PropTypes.any,
  /** Minimum number of rows in the textarea */
  minRows: PropTypes.number,
  /** Maximum number of rows in the textarea */
  maxRows: PropTypes.number,
  /** Whether autosizing is available or not */
  enabled: PropTypes.bool,
};

const TextAreaAutosizeDefaultProps = {
  input: null,
  minRows: null,
  maxRows: null,
  enabled: true,
};

TextAreaAutosize.propTypes = {
  ...TextAreaAutosizePropTypes,
  __platform: PlatformPropTypes,
  __extensionManager: ExtensionPropTypes,
};

TextAreaAutosize.defaultProps = {
  ...TextAreaAutosizeDefaultProps,
  __platform: PlatformDefaultProps,
  __extensionManager: ExtensionDefaultProps,
};

// Extension manager is automatically injected since it's in Extensions
const StackedTextAreaAutosize = stack(
  withPlatformConsumer,
)(TextAreaAutosize);

StackedTextAreaAutosize.displayName = 'Autosize';
StackedTextAreaAutosize.propTypes = TextAreaAutosizePropTypes;
StackedTextAreaAutosize.defaultProps = TextAreaAutosizeDefaultProps;

export default StackedTextAreaAutosize;

/**
 * Private methods
 */
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
  const textAreaClone = this.props.input.cloneNode(false);
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
  this.props.input.parentNode.appendChild(textAreaClone);
  this.setState({ cachedLineHeight: textAreaClone.clientHeight }, () => {
    // remove ghost node after caching line height
    this.props.input.parentNode.removeChild(textAreaClone);
  });

  // Min and max heights have to be re-calculated if the cached line height changes
  window.requestAnimationFrame(() => {
    this.setMinHeight();
    this.setMaxHeight();
  });
}

function storeInitialHeight() {
  if (this.props.__platform.is('browser')) {
    // Remember the height which we started with in case autosizing is disabled
    this.setState({ initialHeight: this.props.input.style.height }, () => {
      this.resizeToFitContent();
      window.addEventListener('resize', this.resizeListener);
    });
  }
}
