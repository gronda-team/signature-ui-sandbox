import * as React from 'react';
import _ from 'lodash';
import {ViewportRulerDefaultProps, ViewportRulerPropTypes, withViewportRuler} from '../../scrolling';
import {GlobalScrollBlock} from './styles';

class BlockScrollStrategy extends React.Component {
  constructor() {
    super();

    this.state = {
      /** Dummy renderer to steal the class names */
      renderDummyBlock: true,
      /** References to styling/scrolling before strategy enabled */
      previousHTMLStyles: { top: '', left: '' },
      previousScrollPosition: { top: null, left: null },
      /** Whether the scroll strategy is active */
      enabled: false,
    };

    this.BLOCK_CLASS_LIST = [];
  }

  /**
   * Refs
   */
  /** Get the dummy classes */
  getDummyBlock = (el) => {
    if (el) {
      this.BLOCK_CLASS_LIST = _.castArray(el.classList);
    }
  };

  /**
   * Actions
   */
  /** Blocks page-level scrolling when open */
  enable = () => {
    if (canBeEnabled.call(this)) {
      const root = _.get(document, 'documentElement', null);

      /** Cache the previous styles */
      const previousScrollPosition = this.props.__viewportRuler.getViewportScrollPosition();
      const previousHTMLStyles = {
        left: root.style.left || '',
        top: root.style.top || '',
      };

      this.setState({
        previousScrollPosition,
        previousHTMLStyles,
        enabled: true,
      }, () => {
        /**
         * Target the HTML node instead of body because body may have the
         * user agent margin, whereas the HTML tag is guaranteed not to
         * have one.
         */
        root.style.left = `${-previousScrollPosition.left}px`;
        root.style.top = `${-previousScrollPosition.top}px`;
        this.BLOCK_CLASS_LIST.forEach((className) => {
          root.classList.add(className);
        });
      });
    }
  };

  /** Disable the block strategy */
  disable = () => {
    if (this.state.enabled) {
      const html = document.documentElement;
      const body = document.body;
      const htmlStyle = html.style;
      const bodyStyle = body.style;
      const previousHtmlScrollBehavior = htmlStyle.scrollBehavior || '';
      const previousBodyScrollBehavior = bodyStyle.scrollBehavior || '';

      this.setState({ enabled: false }, () => {
        htmlStyle.left = this.state.previousHTMLStyles.left;
        htmlStyle.top = this.state.previousHTMLStyles.top;
        this.BLOCK_CLASS_LIST.forEach((className) => {
          root.classList.remove(className);
        });

        // Disable user-defined smooth scrolling temporarily while we restore the scroll position.
        // See https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior
        htmlStyle.scrollBehavior = bodyStyle.scrollBehavior = 'auto';

        window.scroll(
          this.state.previousScrollPosition.left,
          this.state.previousScrollPosition.top,
        );

        htmlStyle.scrollBehavior = previousHtmlScrollBehavior;
        bodyStyle.scrollBehavior = previousBodyScrollBehavior;
      });
    }
  };

  /**
   * Render the dummy block on instantiation but then hide it.
   * We want to steal the styled-component styles from this guy
   * and then immediately hide it.
   */
  render = () => (
    this.state.renderDummyBlock ? (
      <GlobalScrollBlock
        style={{ display: 'none' }}
        innerRef={this.getDummyBlock}
      />
    ) : null
  );
}

BlockScrollStrategy.propTypes = {
  __viewportRuler: ViewportRulerPropTypes,
};

BlockScrollStrategy.defaultProps = {
  __viewportRuler: ViewportRulerDefaultProps,
};

const StackedBlockScrollStrategy = withViewportRuler(BlockScrollStrategy);

export default StackedBlockScrollStrategy;

/**
 * Private methods
 */
function canBeEnabled() {
  /**
   * Since the scroll strategies can't be singletons, we have to use a global CSS class
   * (`cdk-global-scrollblock`) to make sure that we don't try to disable global
   * scrolling multiple times.
   */
  const html = document.documentElement;
  const hasBlockClasses = _.every(this.BLOCK_CLASS_LIST, className => (
    html.classList.contains(className)
  ));

  if (this.state.enabled || hasBlockClasses) {
    return false;
  }

  const body = document.body;
  const viewport = this.props.__viewportRuler.getViewportSize();
  return body.scrollHeight > viewport.height || body.scrollWidth > viewport.width;
}
