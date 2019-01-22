import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { BaseAccordionProvider } from './context';

class BaseAccordion extends React.Component {
  constructor() {
    super();
    
    this.DEFAULT_ID = _.uniqueId('sui-accordion:');
  }
  
  /**
   * Derived data
   */
  /** Accordion id */
  getId = () => this.props.id || this.DEFAULT_ID;
  
  /** Handle props.expanded as an array for easier context types */
  expandedAsArray = () => {
    const values = _.castArray(this.props.expanded);
    if (this.props.multi) return values;
    return _.isNil(this.props.expanded) ? [] : values;
  };
  
  /** Context provider value */
  // TODO: performance concern? creating new value each render...
  providerValue = () => ({
    id: this.getId(),
    expanded: this.expandedAsArray(),
    changeExpanded: this.props.onSelect,
  });
  
  render() {
    return (
      <BaseAccordionProvider value={this.providerValue()}>
        { this.props.children }
      </BaseAccordionProvider>
    )
  }
}


BaseAccordion.propTypes = {
  /** Whether the accordion should allow multiple expanded accordion items simultaneously. */
  multi: PropTypes.bool,
  /** The ID(s) of the accordion items that are open */
  expanded: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  /** Callback for handling change events */
  onSelect: PropTypes.func,
};

BaseAccordion.defaultProps = {
  multi: false,
  expanded: null,
  onSelect: _.noop,
};

export default BaseAccordion;
