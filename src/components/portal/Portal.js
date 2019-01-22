import * as React from 'react';
import ReactDOM from 'react-dom';
import entries from 'lodash/entries';
import PropTypes from 'prop-types';
import isFunction from 'lodash/isFunction';
import { Backdrop, PortalOverlayPane, PortalOverlayStyle } from './styles';
import { ESC, ESCAPE } from '../core/keys';
import applyBlockingScrollStrategy from './portal/block-scroll-strategy';

const SCROLL_STRATEGIES = {
  block: applyBlockingScrollStrategy,
};

export default class Portal extends React.Component {
  constructor() {
    super();
    
    this.state = {
    
    }
    
    this.CONTAINER_EL = document.createElement('div');
    entries({
      pointerEvents: 'none',
    // The container   should be the size of the viewport.
      top: 0,
      left: 0,
      height: '100%',
      width: '100%',
      position: 'fixed',
      zIndex: 1000,
    }).forEach(([attribute, value]) => {
      this.CONTAINER_EL.style[attribute] = value;
    });
  }
  
  componentDidMount() {
    document.body.appendChild(this.CONTAINER_EL);
    this.CONTAINER_EL.style.display = this.props.open ? 'block' : 'none';
    this.handleEventListening(this.props);
  }
  
  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.onKeyDown, true);
    document.body.removeChild(this.CONTAINER_EL);
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.open !== this.props.open) {
      // SCROLL_STRATEGIES[this.props.scrollStrategy].call(this, this.props);
      this.handleEventListening(this.props);
      this.CONTAINER_EL.style.display = this.props.open ? 'block' : 'none';
    }
  }
  
  /*
  Listening for updates
   */
  handleEventListening = (props) => {
    if (props.open) {
      document.body.addEventListener('keydown', this.onKeyDown, true);
    } else {
      document.body.removeEventListener('keydown', this.onKeyDown, true);
    }
  };
  
  /*
  Event handlers
   */
  onKeyDown = (event) => {
    if (isFunction(this.props.onKeyDown)) {
      this.props.onKeyDown(event);
    }
    
    if (event.key === ESC || event.key === ESCAPE) {
      if (isFunction(this.props.onClose)) {
        this.props.onClose();
      }
    }
  };
  
  getOverlayStyle = (props) => ({
    width: props.width,
    left: props.left,
    top: props.top,
    // transformOrigin: props.origin,
    transform: `translateY(${props.offsetY}px)`,
  });
  
  render() {
    return ReactDOM.createPortal(
      <React.Fragment>
        <Backdrop onClick={this.props.onBackdropClick} />
        <PortalOverlayPane>
          <PortalOverlayStyle
            style={this.getOverlayStyle(this.props)}
          >
            { this.props.children }
          </PortalOverlayStyle>
        </PortalOverlayPane>
      </React.Fragment>,
      this.CONTAINER_EL,
    );
  }
}

Portal.propTypes = {
  scrollStrategy: PropTypes.oneOf(['block', 'close', 'noop']),
  open: PropTypes.bool,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  onKeyDown: PropTypes.func,
};

Portal.defaultProp = {
  scrollStrategy: 'noop',
  open: false,
  onOpen: null,
  onClose: null,
  onKeyDown: null,
};
