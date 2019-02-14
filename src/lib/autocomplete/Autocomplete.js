import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {ListKeyManager} from '../../cdk/a11y';
import {byInternalType, stack} from '../core/components/util';
import { Overlay } from '../../cdk/overlay';
import FlexibleConnectedPositionStrategy from '../../cdk/overlay/position/FlexibleConnectedPositionStrategy';
import RepositionScrollStrategy from '../../cdk/overlay/scroll/RepositionScrollStrategy';
import { OptionParentProvider } from '../core/option';
import {AutocompletePanel, AutocompletePanelRoot} from './styles';
import {FormFieldDefaultProps, FormFieldPropTypes, withFormFieldConsumer} from '../form-field';

const toArray = React.Children.toArray;

/**
 * Autocomplete panel
 */
class Autocomplete extends React.Component {
  constructor() {
    super();

    this.state = {
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
      /** Map of child refs to register and deregister */
      childRefs: {},
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
  componentDidMount() {
    /** Register this extension in the form field container */
    if (this.props.__formFieldControl) {
      this.props.__formFieldControl.setExtension('autocomplete', this);
    }
  }

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
  isOpen = () => this.state.isOpen && !!this.getOptions().length;

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
    onSelectionChange: this.state.service.onSelectionChange,
    activeItem: this.state.activeItem,
    monitor: this.monitor,
    stopMonitoring: this.stopMonitoring,
  });

  /**
   * Actions
   */
  handleActiveItemChange = (index) => {
    this.setState({
      /**
       * Manually sync the active item here
       * because otherwise the Autocomplete component
       * would be one tick behind the key manager
       * component.
       *
       * This way, this.state.activeItem will reflect
       * the actual item instead of prevState.activeItem.
       */
      activeItem: _.get(this.getOptions(), [index]),
    });
  };

  /** Callback for the "select" event */
  emitSelectEvent = (option) => {
    this.props.onSelect({
      option,
      source: this,
    });
  };

  monitor = (child) => {
    const value = _.get(child, 'props.value');
    this.setState(state => ({
      childRefs: {
        ...state.childRefs,
        [value]: child,
      },
    }));
  };

  stopMonitoring = (value) => {
    this.setState((state) => {
      const { [value]: omit, ...rest } = state.childRefs;
      return { childRefs: rest };
    });
  };

  /**
   * Renderers
   */
  render() {
    const {
      id, autoActiveFirstOption, children, ...restProps
    } = this.props;

    const origin = this.props.__formFieldControl.getConnectionContainer() || null;

    return (
      <React.Fragment>
        <ListKeyManager
          wrap
          onTabOut={this.state.service.onTabOut}
          onChange={this.handleActiveItemChange}
          items={this.getOptions()}
          ref={this.keyManager}
        />
        <FlexibleConnectedPositionStrategy
          origin={origin}
          overlay={this.overlay.current}
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

const AutocompletePropTypes = {
  /**
   * Whether the first option is highlighted when the panel
   * is first open
   */
  autoActiveFirstOption: PropTypes.bool,
  /** ID for the panel */
  id: PropTypes.string,
  /** Fixed panel width */
  panelWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Callback for event emitting when autocomplete option is selected */
  onSelect: PropTypes.func,
};

const AutocompleteDefaultProps = {
  autoActiveFirstOption: false,
  id: null,
  panelWidth: null,
  onSelect: _.noop,
};

Autocomplete.propTypes = {
  ...AutocompletePropTypes,
  __formFieldControl: FormFieldPropTypes,
};

Autocomplete.defaultProps = {
  ...AutocompleteDefaultProps,
  __formFieldControl: FormFieldDefaultProps,
};

const StackedAutocomplete = stack(
  withFormFieldConsumer,
)(Autocomplete);

StackedAutocomplete.propTypes = AutocompletePropTypes;
StackedAutocomplete.defaultProps = AutocompleteDefaultProps;

export default StackedAutocomplete;

/**
 * Private methods
 */
/** Get the panel width that the autocomplete should have */
function getPanelWidth() {
  return this.props.panelWidth || getHostWidth.call(this);
}

/** Get the width of the input element so the panel width can match */
function getHostWidth() {
  const connectionContainer = this.props.__formFieldControl.getConnectionContainer();

  if (!connectionContainer) return null;
  return connectionContainer.getBoundingClientRect().width;
}
