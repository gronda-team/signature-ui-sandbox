import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {ListKeyManager} from '../../cdk/a11y';
import {byInternalType} from '../core/components/util';

const toArray = React.Children.toArray;

/**
 * Autocomplete panel
 */
class Autocomplete extends React.Component {
  constructor() {
    super();

    this.state = {
      /** Whether the autocomplete panel should be visible */
      showPanel: false,
      /** Whether the panel is visible */
      isOpen: false,
    };

    this.DEFAULT_ID = _.uniqueId('sui-autocomplete-panel:');
    this.PANEL = React.createRef();
  }

  /**
   * Derived data
   */
  /** Final ID for the component */
  getId = () => this.props.id || this.DEFAULT_ID;

  /** Getter for whether or not the panel is open */
  isOpen = () => this.state.isOpen && this.state.showPanel;

  /** Children */
  getChildren = (props = this.props) => toArray(props.children);

  /** Get option groups */
  getOptionGroups = () => (
    this.getChildren().filter(byInternalType('OptGroup'))
  );

  /** Get the option children */
  getOptions = () => {
    const optionGroups = this.getOptionGroups();
    if (!optionGroups.length) {
      /** If there are no option groups, then filter all children by option */
      return this.getChildren().filter(byInternalType('Option'));
    }

    /** Reduce the children to an array of option children */
    return optionGroups.reduce((options, group) => {
      return options.concat(
        this.getChildren(group.props).filter(byInternalType('Option')),
      );
    }, []);
  };

  /**
   * Renderers
   */
  render() {
    const {
      id, autoActiveFirstOption, children, ...restProps
    } = this.props;

    return (
      <React.Fragment>
        <ListKeyManager
          wrap
          items={this.getOptions()}
        />
        <AutocompletePanelRoot
          {...restProps}
        >
          <AutocompletePanel
            role="listbox"
            id={this.getId()}
            innerRef={this.PANEL}
          >
            { children }
          </AutocompletePanel>
        </AutocompletePanelRoot>
      </React.Fragment>
    );
  }
}

Autocomplete.propTypes = {
  /**
   * Whether the first option is highlighted when the panel
   * is first open
   */
  autoActiveFirstOption: PropTypes.bool,
  /** ID for the panel */
  id: PropTypes.string,
};

Autocomplete.defaultProps = {
  autoActiveFirstOption: false,
  id: null,
};

export default Autocomplete;
