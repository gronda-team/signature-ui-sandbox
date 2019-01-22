import * as React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { OverlayBackdrop } from './styles/index';

/*
Overlays are structured as follows
- container
  - backdrop
  - children
 */

const ROOT_STYLE = {
  position: 'fixed',
  zIndex: 1000,
  pointerEvents: 'none',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
};

export default class Overlay extends React.Component {
  /*
  Create a higher order component that automatically sets a constant
  this.props.el into the Overlay container
   */
  static inject(el) {
    function OverlayIn(props) {
      return <Overlay {...props} el={el} />;
    }
    
    OverlayIn.displayName = `OverlayIn(${el})`;
    
    return OverlayIn;
  }
  
  constructor() {
    super();
    
    this.state = {
      mount: false, // in case it's SSR
      backdropAttached: false,
    };
  }
  
  componentDidMount() {
    this.setState({ mount: true }, () => {
      if (this.props.backdrop) {
        attachBackdrop.call(this);
      }
    });
    
    this.props.setRoot(this.getModalRoot());
  }
  
  getModalRoot = () => {
    if (this.props.el) {
      const el = document.querySelector(this.props.el);
      if (el) return el;
    }
    
    const suiRoot = document.querySelector('.sui-modal-root');
    if (suiRoot) return suiRoot;
    
    const root = document.createElement('div');
    /*
    Everything below this line will be instantiated just once
     */
    root.classList.add('sui-modal-root'); // add class (no styling here, just for querySelector)
    _.forEach(_.entries(ROOT_STYLE), ([key, value]) => {
      // add all of the necessary values to the style
      root.style[key] = value;
    });
    
    document.body.appendChild(root);
    return root;
  };
  
  renderChildren = () => (
    <React.Fragment>
      { this.props.backdrop ? (
        <OverlayBackdrop
          visible={this.state.backdropAttached}
          onClick={this.props.backdropClick}
          data-shade={this.props.backdrop}
        />
      ) : null}
      { this.props.children }
    </React.Fragment>
  );
  
  render() {
    return this.state.mount ? ReactDOM.createPortal(
      this.renderChildren(),
      this.getModalRoot(),
    ) : null;
  }
}

Overlay.propTypes = {
  el: PropTypes.string,
  backdrop: PropTypes.oneOf(['transparent', 'dark', 'light', null]),
  backdropClick: PropTypes.func,
  setRoot: PropTypes.func, // as an accessible EL for child components
};

Overlay.defaultProps = {
  el: null,
  backdrop: 'transparent',
  backdropClick: _.noop,
  setRoot: _.noop,
};

/*
Private methods
 */
function attachBackdrop() {
  _.defer(() => {
    this.setState({ backdropAttached: true });
  });
}
