import * as React from 'react';
import _ from 'lodash';
import { OverlayContainerRoot } from './styles/index';
import { OverlayContainerProvider } from './context/overlay-container';
import OverlayKeyboardDispatcher from './keyboard/KeyboardDispatcher';

/** Container inside which all overlays will render. */
class OverlayContainer extends React.Component {
  constructor() {
    super();
    
    this.state = {
      renderDummyContainer: true,
      provide: {
        getContainer: this.getContainer,
      },
    };
  }
  
  /**
   * Refs
   */
  getDummyRoot = (dummy) => {
    if (dummy) {
      this.ROOT = dummy;
      _.defer(() => {
        this.setState({ renderDummyContainer: false });
      });
    }
  };
  
  /**
   * Lifecycle
   */
  
  componentWillUnmount() {
    if (this.CONTAINER && this.CONTAINER.parentNode) {
      this.CONTAINER.parentNode.removeChild(this.CONTAINER);
    }
  }
  
  /**
   * Actions
   */
  /**
   * Lazily create and return the overlay container element.
   */
  getContainer = () => {
    if (!this.CONTAINER) {
      createContainer.call(this);
    }
    
    return this.CONTAINER;
  };
  
  render() {
    return (
      <OverlayContainerProvider value={this.state.provide}>
        <OverlayKeyboardDispatcher>
          <React.Fragment>
            { this.props.children }
            { this.state.renderDummyContainer ?
              <OverlayContainerRoot innerRef={this.getDummyRoot} /> : null
            }
          </React.Fragment>
        </OverlayKeyboardDispatcher>
      </OverlayContainerProvider>
    );
  }
}

export default OverlayContainer;

/**
 * Private methods
 */
/**
 * Create the overlay container element, which is simply a div
 * with the 'cdk-overlay-container' class on the document body.
 */
function createContainer() {
  if (this.ROOT) {
    const container = document.createElement('div');
    const rootClasses = Array.from(this.ROOT.classList);
    rootClasses.forEach((className) => {
      // add the styled components class names
      container.classList.add(className);
    });
    // add the container to the body
    document.body.appendChild(container);
    this.CONTAINER = container;
  }
}
