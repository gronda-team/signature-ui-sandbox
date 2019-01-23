import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import BaseAccordion from '../../cdk/accordion/Accordion';
import { AccordionProvider } from './context';
import { AccordionRoot } from './styles/index';
import ListKeyManager, {
  ListKeyManagerDefaultProps, ListKeyManagerPropTypes,
  withListKeyConsumer,
} from '../../cdk/a11y/key-manager/ListKeyManager';
import { END, HOME } from '../../cdk/keycodes/keys';

const toArray = React.Children.toArray;

class Accordion extends React.Component {
  /***
   * Lifecycle
   */
  componentDidMount() {
    // set the key manager's items---HTMLElements
    this.props.__keyManager.setItems(this.ACCORDION_ROOT.children);
    /*
    set the key manager's skipPredicateFn (it's
    not props.disabled, but props.dataset.disabled as 'true' | 'false')
     */
    this.props.__keyManager.setSkipPredicateFn(child => (
      _.get(child.dataset, 'disabled', 'false') === 'true'
    ));
  }
  
  componentDidUpdate(prevProps) {
    if (this.getPanelChildren(prevProps).length !== this.getPanelChildren().length) {
      this.props.__keyManager.setItems(this.ACCORDION_ROOT.children);
    }
  }
  
  /**
   * Refs
   */
  getAccordionRootRef = (accordionRoot) => {
    this.ACCORDION_ROOT = accordionRoot;
  };
  
  /***
   * Actions
   */
  /** Capture the click event to set the nth panel as active */
  onClickCapture = (event) => {
    /*
    Get the active panel from capturing the click event and then set it as the
    active item in the keyManager.
     */
    const activePanel = getActiveItemFromCapturedEvent.call(this, event.nativeEvent);
    if (activePanel) {
      this.props.__keyManager.setActiveItem(activePanel);
    }
    
    // pass event through to user-side listener
    if (_.isFunction(this.props.onClickCapture)) {
      this.props.onClickCapture(event);
    }
  };
  
  /*
  Apply the key down event for navigation.
  - Home button -> go to first accordion item
  - End button -> go to last one
  */
  onKeyDown = (event) => {
    switch (event.key) {
      case HOME:
        event.preventDefault();
        this.props.__keyManager.setFirstItemActive();
        break;
      case END:
        event.preventDefault();
        this.props.__keyManager.setLastItemActive();
        break;
      default:
        this.props.__keyManager.onKeydown(event);
        break;
    }
    
    // pass event through to user-side listener
    if (_.isFunction(this.props.onKeyDown)) {
      this.props.onKeyDown(event);
    }
  };
  
  /**
   * Derived data
   */
  // get the React children as an array
  getChildren = (props = this.props) => toArray(props.children);
  
  // Get the React children that are SUI Panels
  getPanelChildren = (props = this.props) => this.getChildren(props).filter(child => (
    _.get(child.props, '__sui-internal-type') === 'Panel'
  ));
  
  // Context value for provider
  providerValue = () => ({
    hideToggle: this.props.hideToggle,
    displayMode: this.props.displayMode,
  });
  
  render() {
    const { hideToggle, displayMode, multi, expanded, onSelect, ...restProps } = this.props;
    return (
      <BaseAccordion multi={multi} expanded={expanded} onSelect={onSelect}>
        <AccordionRoot
          innerRef={this.getAccordionRootRef}
          {...restProps}
          onClickCapture={this.onClickCapture}
          onKeyDown={this.onKeyDown}
        >
          <AccordionProvider value={this.providerValue()}>
            { this.props.children }
          </AccordionProvider>
        </AccordionRoot>
      </BaseAccordion>
    )
  }
}

Accordion.propTypes = {
  /** Whether the accordion should allow multiple expanded accordion items simultaneously. */
  multi: PropTypes.bool,
  /** The ID(s) of the accordion items that are open */
  expanded: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  /** Callback for handling change events */
  onSelect: PropTypes.func,
  /** Whether the expansion indicator should be hidden. */
  hideToggle: PropTypes.bool,
  /**
   * The display mode used for all expansion panels in the accordion. Currently two display
   * modes exist:
   *  default - a gutter-like spacing is placed around any expanded panel, placing the expanded
   *     panel at a different elevation from the rest of the accordion.
   *  flat - no spacing is placed around expanded panels, showing all panels at the same
   *     elevation.
   */
  displayMode: PropTypes.oneOf(['default', 'flat']),
  /** list key manager */
  __keyManager: ListKeyManagerPropTypes,
};

Accordion.defaultProps = {
  multi: false,
  expanded: null,
  onSelect: _.noop,
  hideToggle: false,
  displayMode: 'default',
  __keyManager: ListKeyManagerDefaultProps,
};

const AccordionWithKeyConsumer = withListKeyConsumer(Accordion);

export default function AccordionWithKeyProvider(props) {
  return (
    <ListKeyManager typeAhead={null} vertical={true} wrap={false} horizontal={null}>
      <AccordionWithKeyConsumer {...props} />
    </ListKeyManager>
  );
};

AccordionWithKeyProvider.displayName = 'Accordion';
AccordionWithKeyProvider.propTypes = Accordion.propTypes;
AccordionWithKeyProvider.defaultProps = Accordion.defaultProps;

/**
 * Private methods
 */
/** Traces event.path and gets the activeItem */
function getActiveItemFromCapturedEvent(event) {
  const items = _.toArray(this.ACCORDION_ROOT.children);
  let element = event.target;
  
  while (element) {
    if (element.tagName === 'HTML') return null;
    /*
    don't bother checking it if role !== button
    check if it's one of the children (and one of the keyManager's items)
     */
    if (_.invoke(element, 'getAttribute', 'role') === 'button' && items.indexOf(element) > -1) return element;
    
    element = element.parentElement;
  }
}
