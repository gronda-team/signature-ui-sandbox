import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { BaseAccordionItemProvider, withBaseAccordionConsumer } from './context';
import { stack } from '../../lib/core/components/util';

class BaseAccordionItem extends React.Component {
  constructor() {
    super();
    
    this.DEFAULT_ID = _.uniqueId('sui-accordion-child:');
  }
  
  /**
   * Lifecycle
   */
  componentDidUpdate(prevProps) {
    if (this.isExpanded(prevProps) !== this.isExpanded(this.props)) {
      this.emitExpandedEvents(this.isExpanded(this.props));
    }
  }
  
  /**
   * Derived data
   */
  /** Get usable ID */
  getId = () => this.props.id || this.DEFAULT_ID;
  
  /** Get whether current accordion item is selected */
  isExpanded = (props = this.props) => props.__accordion.expanded.indexOf(this.getId()) > -1;
  
  /** Get context value */
  // TODO: might be a performance constraint? creating new object each render
  providerValue = () => ({
    id: this.getId(),
    expanded: this.isExpanded(),
    disabled: this.props.disabled,
    open: this.open,
    toggle: this.toggle,
    close: this.close,
  });
  
  /**
   * Actions
   */
  emitExpandedEvents = (expanded) => {
    /*
    Emit expansion event and close/open event
     */
    this.props.onExpansion(expanded);
    if (expanded) {
      this.props.onOpen();
    } else {
      this.props.onClose();
    }
  };
  
  /** Toggles the expanded state of the accordion item. */
  toggle = () => {
    if (!this.props.disabled) {
      const id = this.getId();
      this.props.__accordion.changeExpanded(
        this.isExpanded() ?
          { closed: id } : { opened: id }
      );
    }
  };
  
  /** Sets the expanded state of the accordion item to false. */
  close = () => {
    if (!this.props.disabled) {
      this.props.__accordion.changeExpanded({ closed: this.getId() });
    }
  };
  
  /** Sets the expanded state of the accordion item to true. */
  open = () => {
    if (!this.props.disabled) {
      this.props.__accordion.changeExpanded({ opened: this.getId() });
    }
  };
  
  render() {
    /*
    Will pass consumers with the props in providerValue
     */
    return (
      <BaseAccordionItemProvider value={this.providerValue()}>
        { this.props.children }
      </BaseAccordionItemProvider>
    )
  }
}

export const PUBLIC_PROP_TYPES = {
  /** Event emitted every time the AccordionItem is closed. */
  onClose: PropTypes.func,
  /** Event emitted every time the AccordionItem is opened. */
  onOpen: PropTypes.func,
  /**
   * Emits whenever the expanded state of the accordion changes.
   * Primarily used to facilitate two-way binding.
   * @docs-private
   */
  onExpansion: PropTypes.func,
  /** id of the accordion item */
  id: PropTypes.string,
  /** Whether the AccordionItem is disabled. */
  disabled: PropTypes.bool,
};

export const PUBLIC_DEFAULT_PROPS = {
  onClose: _.noop,
  onOpen: _.noop,
  onExpansion: _.noop,
  id: null,
};

BaseAccordionItem.propTypes = {
  ...PUBLIC_PROP_TYPES,
  /** Locates the accordion provider */
  __accordion: PropTypes.shape({
    expanded: PropTypes.arrayOf(PropTypes.string),
    changeExpanded: PropTypes.func,
  }),
};

BaseAccordionItem.defaultProps = {
  ...PUBLIC_DEFAULT_PROPS,
  __accordion: {
    expanded: [],
    changeExpanded: _.noop,
  },
};

const FancyBaseAccordionItem = stack(
  withBaseAccordionConsumer,
)(BaseAccordionItem);

FancyBaseAccordionItem.propTypes = PUBLIC_PROP_TYPES;
FancyBaseAccordionItem.defaultProps = PUBLIC_DEFAULT_PROPS;

export default FancyBaseAccordionItem;
