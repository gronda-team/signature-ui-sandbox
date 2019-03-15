import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {ListKeyManager} from '../../cdk/a11y';
import {byInternalType, stack} from '../core/components/util';
import {
  Overlay,
  RepositionScrollStrategy,
  FlexibleConnectedPositionStrategy,
} from '../../cdk/overlay';
import { OptionParentProvider } from '../core/option';
import {AutocompletePanel, AutocompletePanelRoot} from './styles';
import {FormFieldDefaultProps, FormFieldPropTypes, withFormFieldConsumer} from '../form-field';
import {RTLDefaultProps, RTLPropTypes} from '../../cdk/bidi';
import {
  ExtensionDefaultProps,
  ExtensionPropTypes,
  withExtensionManager
} from '../form-field/context/ExtensionsContext';

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
    if (this.props.__extensionManager) {
      this.props.__extensionManager.updateExtensionData('##autocomplete', {
        autocomplete: this,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.PANEL.current && prevState.scrollTop !== this.state.scrollTop) {
      // Manually set the scrolltop position
      this.PANEL.current.scrollTop = this.state.scrollTop;
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

  /** Get directionality */
  getDir = () => ['ltr', 'rtl'].indexOf(this.props.dir) > -1 ?
    this.props.dir :
    'ltr';

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
    activeItem: _.get(
      this.props.__extensionManager,
      ['extendedData', '##autocomplete', 'data', 'activeItem']
    ),
    monitor: this.monitor,
    stopMonitoring: this.stopMonitoring,
  });

  /**
   * Actions
   */
  handleActiveItemChange = (index) => {
    const options = this.getOptions();
    const activeItemValue = _.get(options, [index, 'props', 'value']);
    const activeItem = _.find(
      _.get(
        this.props.__extensionManager,
        ['extendedData', '##autocomplete', 'data', 'childRefs'],
        {}
      ),
      { props: { value: activeItemValue } }
    );
    this.props.__extensionManager.updateExtensionData('##autocomplete', {
      /**
       * Manually sync the active item here
       * because otherwise the Autocomplete component
       * would be one tick behind the key manager
       * component.
       *
       * This way, this.props.__extensionManager. ... .activeItem will reflect
       * the actual item instead of prevState.activeItem.
       */
      activeItem,
    });

    this.props.__extensionManager.updateExtensionAttributes('##autocomplete', {
      'aria-activedescendant': _.invoke(activeItem, 'getId'),
    });
  };

  /** Callback for the "select" event */
  emitSelectEvent = (option) => {
    this.props.onSelect({
      option,
      source: this,
    });
  };

  monitor = ({ id, source }) => {
    this.props.__extensionManager.updateExtensionData('##autocomplete', state => ({
      childRefs: {
        ...state.childRefs,
        [id]: source,
      },
    }));
  };

  stopMonitoring = (value) => {
    this.props.__extensionManager.updateExtensionData('##autocomplete', (state) => {
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
          dir={this.getDir()}
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
  /** Add directionality context */
  ...RTLPropTypes,
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
  /** Callback for opening and closing */
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
};

const AutocompleteDefaultProps = {
  ...RTLDefaultProps,
  autoActiveFirstOption: false,
  id: null,
  panelWidth: null,
  onSelect: _.noop,
  onOpen: _.noop,
  onClose: _.noop,
};

Autocomplete.propTypes = {
  ...AutocompletePropTypes,
  __formFieldControl: FormFieldPropTypes,
  __extensionManager: ExtensionPropTypes,
};

Autocomplete.defaultProps = {
  ...AutocompleteDefaultProps,
  __formFieldControl: FormFieldDefaultProps,
  __extensionManager: ExtensionDefaultProps,
};

const StackedAutocomplete = stack(
  withFormFieldConsumer,
  withExtensionManager,
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
