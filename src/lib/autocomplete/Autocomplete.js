import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {ListKeyManager} from '../../cdk/a11y';
import {byInternalType} from '../core/components/util';
import { Overlay } from '../../cdk/overlay';
import FlexibleConnectedPositionStrategy from '../../cdk/overlay/position/FlexibleConnectedPositionStrategy';
import RepositionScrollStrategy from '../../cdk/overlay/scroll/RepositionScrollStrategy';
import { OptionParentProvider } from '../core/option';
import {AutocompletePanel, AutocompletePanelRoot} from './styles';

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
      /** Distance from the top of the panel to the scrolled position */
      scrollTop: 0,
      /** Overlay service items */
      service: {
        /** Tab out function for the key manager */
        onTabOut: _.noop,
        /** Key down function for the overlay */
        onKeyDown: _.noop,
        /** Action to be done when an option is selected */
        onSelectionChange: _.noop,
      },
    };

    this.DEFAULT_ID = _.uniqueId('sui-autocomplete-panel:');
    this.PREFERRED_POSITIONS = [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',

        // The overlay edge connected to the trigger should have squared corners, while
        // the opposite end has rounded corners. We apply a CSS class to swap the
        // border-radius based on the overlay position.
        panelClass: 'sui-autocomplete-panel-opposite'
      }
    ];

    this.PANEL = React.createRef();
    this.keyManager = React.createRef();
    this.overlay = React.createRef();
    this.positionStrategy = React.createRef();
    this.scrollStrategy = React.createRef();
  }

  /**
   * Lifecycle
   */
  componentDidUpdate(prevProps, prevState) {
    if (this.PANEL && prevState.scrollTop !== this.state.scrollTop) {
      // Manually set the scrolltop position
      this.PANEL.scrollTop = this.state.scrollTop;
    }
  }

  /**
   * Derived data
   */
  /** Final ID for the component */
  getId = () => this.props.id || this.DEFAULT_ID;

  /** Get the current key manager */
  getKeyManager = () => _.get(this.keyManager, 'current', {});

  /** Get the current key manager */
  getOverlay = () => _.get(this.overlay, 'current', {});

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

  /** Get the provider parent to determine what to do on selection change */
  providerValue = () => ({
    onSelectionChange: this.state.onSelectionChange,
  });

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
          onTabOut={this.state.service.onTabOut}
          items={this.getOptions()}
          ref={this.keyManager}
        />
        <FlexibleConnectedPositionStrategy
          hasFlexibleDimensions={false}
          canPush={false}
          preferredPositions={this.PREFERRED_POSITIONS}
          ref={this.positionStrategy}
        />
        <RepositionScrollStrategy
          overlay={this.overlay.current}
          ref={this.scrollStrategy}
        />
        <Overlay
          onKeyDown={this.state.service.onKeyDown}
          positionStrategy={this.positionStrategy.current}
          scrollStrategy={this.scrollStrategy.current}
          width={getPanelWidth.call(this)}
          ref={this.overlay}
        >
          <AutocompletePanelRoot
            {...restProps}
            data-visible={this.isOpen()}
          >
            <AutocompletePanel
              role="listbox"
              id={this.getId()}
              innerRef={this.PANEL}
            >
              <OptionParentProvider value={this.providerValue()}>
                { children }
              </OptionParentProvider>
            </AutocompletePanel>
          </AutocompletePanelRoot>
        </Overlay>
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

/**
 * Private methods
 */
/** Get the panel width that the autocomplete should have */
function getPanelWidth() {
  return this.props.panelWidth || getHostWidth.call(this);
}

/** Get the width of the input element so the panel width can match */
function getHostWidth() {
  return this.props.__formFieldControl.getConnectedElement()
    .getBoundingClientRect().width;
}
