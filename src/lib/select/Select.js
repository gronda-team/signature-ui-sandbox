import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { FormFieldPropTypes, FormFieldDefaultProps, withFormFieldConsumer } from '../form-field';
import { ListKeyManager } from '../../cdk/a11y';
import { countGroupLabelsBeforeOption, getOptionScrollPosition } from '../core/option/util';
import {ARROW_DOWN, ARROW_KEYS, ARROW_UP, DOWN, END, ENTER, HOME, SPACE, SPACEBAR, UP} from '../../cdk/keycodes/keys';
import { stack } from '../core/components/util';
import { isRtl } from '../../cdk/bidi';
import {
  SelectPanel, SelectPlaceholder, SelectRoot, SelectTrigger, SelectValue,
  SelectValueText,
} from './styles/index';
import { ConnectedOverlay } from '../../cdk/overlay';
import {SelectionModel} from '../../cdk/collections';
import {withPlatformConsumer} from '../../cdk/platform';
import {hasModifierKey} from '../../cdk/keycodes/modifiers';
import { OptionParentProvider } from '../core/option';
import {SelectArrow, SelectArrowWrapper} from './styles';
import {ViewportRulerDefaultProps, ViewportRulerPropTypes, withViewportRuler} from '../../cdk/scrolling';
import {MENU_SIDE_PADDING} from '../core/styles/menu-common';

/** The max height of the select's overlay panel */
const SELECT_PANEL_MAX_HEIGHT = 160; // px
/** The height of the select items in px. */
const ITEM_HEIGHT = 32; // px
/** The panel's padding on the x-axis */
const SELECT_PANEL_PADDING_X = MENU_SIDE_PADDING;
/** The panel's x axis padding if it is indented (e.g. there is an option group). */
const SELECT_PANEL_INDENT_PADDING_X = SELECT_PANEL_PADDING_X * 2;
/**
 * The select panel will only "fit" inside the viewport if it is positioned at
 * this value or more away from the viewport boundary.
 */
const SELECT_PANEL_VIEWPORT_PADDING = 8;
/**
 * Distance between the panel edge and the option text in
 * multi-selection mode.
 *
 * Calculated as:
 * (SELECT_PANEL_PADDING_X * 1.5) + 20 = 44
 * The padding is multiplied by 1.5 because the checkbox's margin is half the padding.
 * The checkbox width is 16px.
 */
export let SELECT_MULTIPLE_PANEL_PADDING_X = 0;

// Extract React.Children.count
const countChildren = React.Children.count;
const toArray = React.Children.toArray;

class Select extends React.Component {
  constructor() {
    super();
    
    this.state = {
      /** Whether or not the overlay panel is open. */
      panelOpen: false,
      /** The scroll position of the overlay panel, calculated to center the selected option. */
      scrollTop: 0,
      /** The last measured value for the trigger's client bounding rect. */
      triggerRect: { x: 0, y: 0, height: 0, width: 0, left: 0, top: 0 },
      /**
       * The y-offset of the overlay panel in relation to the trigger's top start corner.
       * This must be adjusted to align the selected option text over the trigger text.
       * when the panel opens. Will change based on the y-position of the selected option.
       */
      offsetY: 0,
      /** Same as offsetY, but for the X direction */
      offsetX: 0,
    };

    this.isRtl = isRtl.bind(this);
    this.DEFAULT_ID = _.uniqueId('sui-select:');
    this.POSITIONS = DEFAULT_POSITIONS;
    this.connectedOverlay = React.createRef();
    this.selectionModel = React.createRef();
    this.keyManager = React.createRef();
  }
  
  /** Lifecycle */
  getSnapshotBeforeUpdate(prevProps, prevState) {
    if (!prevState.panelOpen && this.state.panelOpen) {
      // if we're opening, recalculate the bounding rectangle
      return this.TRIGGER.getBoundingClientRect();
    }
  
    return null;
  }
  
  componentDidMount() {
    /*
    Setup wrt parent context components
     */
    /** Set the form field's onContainerClick function */
    this.props.__formFieldControl.setContainerClick(this.onContainerClick);

    /** Set the reposition callback as _.once() so it doesn't infinitely loop */
    this.oncePositionChange = _.once(this.onPositionChange);
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.setState({ triggerRect: snapshot });
    }
    
    if (this.state.open && (prevState.scrollTop !== this.state.scrollTop)) {
      // if we're open and we have a new scroll top, set it on the panel
      this.PANEL.scrollTop = this.state.scrollTop;
    }
  }
  
  /** element refs */
  getRoot = (root) => {
    this.ROOT = root;
  };
  
  getTriggerEl = (el) => {
    this.TRIGGER = el;
  };
  
  getPanelEl = (el) => {
    this.PANEL = el;
  };
  
  /**
   * Actions
   */
  /** For the form field control */
  onContainerClick = () => {
    this.focus();
    this.open();
  };
  
  /** Focuses the native element */
  focus = () => {
    this.ROOT.focus();
  };
  
  /** Toggles the overlay panel open or closed */
  toggle = () => {
    this.state.panelOpen ? this.close() : this.open();
  };
  
  /** Opens the overlay panel. */
  open = () => {
    if (this.props.disabled || this.state.panelOpen || !this.hasOptions()) {
      return;
    }
    
    this.setState({ panelOpen: true }, () => {
      calculateOverlayPosition.call(this);
      highlightCorrectOption.call(this);
    });
  };
  
  /** Closes the overlay panel and focuses the host element. */
  close = () => {
    if (this.state.panelOpen) {
      this.setState({ panelOpen: false }, () => {
        this.oncePositionChange = _.once(this.onPositionChange);
      });
    }
  };
  
  /** Handle when the user tabs out of the panel */
  onTabOut = () => {
    this.focus();
    this.close();
  };
  
  /** Handles all keydown events on the select. */
  handleKeyDown = (event) => {
    if (!this.props.disabled) {
      this.state.panelOpen ? handleOpenKeydown.call(this, event) : handleClosedKeydown.call(this, event);
    }
  };

  onFocus = () => {
    // Easier for tests
    if (!this.props.disabled) {
      this.setState({ focused: true });
      this.props.__formFieldControl.transitionUi('FOCUS');
    }
  };
  
  onBlur = () => {
    this.setState({ focused: false });
    this.props.__formFieldControl.transitionUi('BLUR');
    if (!this.props.disabled && !this.state.panelOpen) {
      _.invoke(this.props, 'onTouched');
    }
  };

  onPositionChange = () => {
    setPseudoCheckboxPaddingSize.call(this);
    calculateOverlayOffsetX.call(this);
    this.PANEL.scrollTop = this.state.scrollTop;
  };

  /** Callback that's invoked whenever an option is selected */
  onOptionSelectionChange = (event) => {
    // Uses a synthetic (non-real) event
    onSelect.call(this, event.source, event.isUserInput);

    if (event.isUserInput && !this.props.multiple && this.state.panelOpen) {
      this.close();
      this.focus();
    }
  };

  /** Callback for when the overlay position changes */
  handleOverlayPositionChange = () => {
    this.oncePositionChange();
  };

  /** Callback that is invoked when the value is changed */
  handleValueChange = () => {
    if (this.state.panelOpen && this.PANEL) {
      scrollActiveOptionIntoView.call(this);
    } else if (
      !this.state.panelOpen && !this.props.multiple
      && this.keyManager.current.state.activeItem
    ) {
      this.keyManager.current.activeItem.selectViaInteraction();
    }
  };
  
  /** Callback that is invoked when the overlay panel has been attached. */
  onAttached = () => {
    calculateOverlayOffsetX.call(this);
    // set the scrollTop on the panel
    this.PANEL.scrollTop = this.state.scrollTop;
  };
  
  /**
   * Derived data
   */
  /** Get the provider value used by the Option children */
  getOptionParentProviderValue = () => ({
    multiple: this.props.multiple,
    onSelectionChange: this.onOptionSelectionChange,
  });

  /** Get the options as a flat list */
  getOptions = (props = this.props) => {
    const children = toArray(props.children);
    // if some of the children are OptGroups
    if (this.getOptionGroups(props).length) {
      return children.reduce((acc, child) => {
        const options = toArray(_.get(child.props, 'children'));
        // reduce the options from the option group into an array of all the options
        acc = [...acc, ...options];
        return acc;
      }, []);
    }
  
    return children;
  };
  
  /** Get the option groups */
  getOptionGroups = (props = this.props) => {
    const children = toArray(props.children);
    return children.filter(child => (
      _.get(child.props, '__sui-internal-type') === 'OptGroup'
    ));
  };
  
  getOptionIds = () => this.getOptions().map(option => _.get(option.props, 'id'));
  
  /** Query if the flat list is not empty */
  hasOptions = () => _.get(this.getOptions(), 'length', 0);
  
  /** Get the appropriate id for the form field */
  getId = () => this.props.id || this.DEFAULT_ID;
  
  /** Retrieve the trigger component */
  getTrigger = () => {
    return toArray(this.props.children)
      .filter(child => _.get(child.props, '__sui-internal-type') === 'Trigger');
  };

  /** Get specific directionality when it's open */
  getDirectionality = () => this.state.panelOpen ?
    null : this.props.dir;
  
  /** Whether the select has a value. */
  isEmpty = () => !this.selectionModel.current || this.selectionModel.current.isEmpty();
  
  /** Returns the aria-label of the select component. */
  getAriaLabel = () => {
    if (this.props['aria-labelledby']) return null;
    return this.props['aria-label'] || this.props.placeholder;
  };
  
  /** Returns the aria-labelledby of the select component. */
  getAriaLabelledBy = () => {
    if (this.props['aria-labelledby']) return this.props['aria-labelledby'];
    // Note: we use `getAriaLabel` here, because we want to check whether there's a
    // computed label. `this.ariaLabel` is only the user-specified label.
    if (!this.props.__formFieldControl.id || this.getAriaLabel()) {
      return null;
    }

    return `${this.props.__formFieldControl.id}--label` || null;
  };
  
  /** Determines the `aria-activedescendant` to be set on the host. */
  getAriaActiveDescendant = () => {
    if (this.state.panelOpen && this.keyManager.current.state.activeItem) {
      return _.get(this.keyManager.current.state.activeItem, 'activeItem.id');
    }
    
    return null;
  };
  
  /** */
  getAriaDescribedBy = () => (this.props.__formFieldControl.describedByIds || []).join(' ') || null;
  
  triggerValue = () => {
    if (this.isEmpty()) return '';
    const options = this.getOptions();
    const selected = this.selectionModel.current.selected();
    if (this.props.multiple) {
      const selectedOptionIndices = selected.map(getOptionIndexFromValue);
      
      if (this.isRtl()) {
        selectedOptionIndices.reverse();
      }
      const selectedOptions = selectedOptionIndices
        .map(index => _.get(options, [index, 'props', 'viewValue']));
      
      return selectedOptions.join(`${this.props.delimiter} `);
    }
    
    return _.get(options, [getOptionIndexFromValue(_.head(selected)), 'props', 'viewValue']);
  };
  
  /** Render the non-trigger children */
  renderNonTriggerChildren = () => {
    return toArray(this.props.children)
      .filter(child => _.get(child.props, '__sui-internal-type') !== 'Trigger');
  };
  
  renderSelectValue = () => {
    if (this.isEmpty()) {
      return (
        <SelectPlaceholder>{ this.props.placeholder || '\u00a0' }</SelectPlaceholder>
      );
    }
    
    const trigger = this.getTrigger();
    return (
      <SelectValueText>
        { trigger ? trigger :
          <span>{ this.triggerValue() || '\u00a0'}</span>
        }
      </SelectValueText>
    )
  };
  
  render() {
    // Todo: aria-invalid and errorState
    return (
      <SelectRoot
        role="listbox"
        id={this.getId()}
        tabIndex={this.props.tabIndex}
        aria-label={this.getAriaLabel()}
        aria-labelledby={this.getAriaLabelledBy()}
        aria-required={this.props.required.toString()}
        aria-disabled={this.props.disabled.toString()}
        aria-invalid={false}
        aria-owns={this.state.panelOpen ? this.getOptionIds() : null}
        aria-multiselectable={this.props.multiple.toString()}
        aria-describedby={this.getAriaDescribedBy()}
        aria-activedescendant={this.getAriaActiveDescendant()}
        onKeydown={this.handleKeyDown}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        ref={this.getRoot}
      >
        <SelectionModel
          value={this.props.value}
          multiple={this.props.multiple}
          onChange={this.props.onSelectionChange}
          ref={this.selectionModel}
        />
        <ListKeyManager
          vertical
          horizontal={this.getDirectionality()}
          onTabOut={this.onTabOut}
          onChange={this.handleValueChange}
          allowedModifierKeys={['shiftKey']}
          ref={this.keyManager}
        />
        <SelectTrigger
          aria-hidden="true"
          onClick={this.toggle}
          ref={this.getTriggerEl}
        >
          <SelectValue>{ this.renderSelectValue() }</SelectValue>
          <SelectArrowWrapper>
            <SelectArrow />
          </SelectArrowWrapper>
        </SelectTrigger>
        <ConnectedOverlay
          lockPosition
          backdrop="transparent"
          origin={this.TRIGGER}
          open={this.state.panelOpen}
          positions={this.POSITIONS}
          minWidth={_.get(this.state.triggerRect, 'width', null)}
          offsetY={this.state.offsetY}
          backdropClick={this.close}
          onAttached={this.onAttached}
          onDetached={this.close}
          onPositionChange={this.handleOverlayPositionChange}
          ref={this.connectedOverlay}
        >
          <SelectPanel
            style={{
              transformOrigin: this.state.transformOrigin,
            }}
            onKeydown={this.handleKeyDown}
            ref={this.getPanelEl}
          >
            <OptionParentProvider value={this.getOptionParentProviderValue()}>
              { this.renderNonTriggerChildren() }
            </OptionParentProvider>
          </SelectPanel>
        </ConnectedOverlay>
      </SelectRoot>
    )
  }
}

const SelectPropTypes = {
  /** Whether filling out the select is required in the form. */
  required: PropTypes.bool,
  /** The placeholder displayed in the trigger of the select. */
  placeholder: PropTypes.string,
  /** Whether the component is in multiple selection mode. */
  multiple: PropTypes.bool,
  /** Comparison function to specify which option is displayed. Defaults to object equality. */
  compareWith: PropTypes.func,
  /** Whether to center the active option over the trigger. */
  disableOptionCentering: PropTypes.bool,
  /** Value of the select control. */
  value: PropTypes.any,
  /** Aria label of the select. If not specified, the placeholder will be used as label. */
  'aria-label': PropTypes.string,
  /** Input that can be used to specify the `aria-labelledby` attribute. */
  'aria-labelledby': PropTypes.string,
  /** Function used to sort the values in a select in multiple mode. */
  sortComparator: PropTypes.func,
  /** Unique id of the element. */
  id: PropTypes.string,
  /** Whether the component is disabled. */
  disabled: PropTypes.bool,
  /** Tab index */
  tabIndex: PropTypes.number,
  /** direction */
  dir: PropTypes.oneOf(['ltr', 'rtl', null]),
  /** callback for touched */
  onTouched: PropTypes.func,
  /** delimiter for trigger value + multiple */
  delimiter: PropTypes.string,
};

const SelectDefaultProps = {
  required: false,
  placeholder: '',
  multiple: false,
  compareWith: (o1, o2) => o1 === o2,
  disableOptionCentering: false,
  value: undefined,
  'aria-label': '',
  'aria-labelledby': '',
  sortComparator: _.noop,
  id: null,
  disabled: false,
  dir: 'ltr',
  tabIndex: 0,
  onTouched: null,
  delimiter: ',',
};

Select.propTypes = {
  ...SelectPropTypes,
  __formFieldControl: FormFieldPropTypes,
  __viewportRuler: ViewportRulerPropTypes,
};

Select.defaultProps = {
  ...SelectDefaultProps,
  __formFieldControl: FormFieldDefaultProps,
  __viewportRuler: ViewportRulerDefaultProps,
};

/**
 * This position config ensures that the top "start" corner of the overlay
 * is aligned with with the top "start" of the origin by default (overlapping
 * the trigger completely). If the panel cannot fit below the trigger, it
 * will fall back to a position above the trigger.
 */
const DEFAULT_POSITIONS = [
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'top',
  },
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'bottom',
  },
];

const StackedSelect = stack(
  withFormFieldConsumer,
  withViewportRuler,
  withPlatformConsumer,
)(Select);

StackedSelect.propTypes = SelectPropTypes;
StackedSelect.defaultProps = SelectDefaultProps;

export default StackedSelect;

/**
 * Private methods to be used inside the Select component
 */

/**
 * Highlights the selected item. If no option is selected, it will highlight
 * the first item instead.
 */
function highlightCorrectOption() {
  if (this.isEmpty()) {
    this.keyManager.current.setFirstItemActive();
  } else {
    this.keyManager.current.setActiveItem(_.head(this.selectionModel.current.selected()));
  }
}

/**
 * Derived data
 */
/** Calculates the amount of items in the select. This includes options and group labels. */
function getItemCount() {
  return _.get(this.getOptions(), 'length', 0) +
    _.get(this.getOptionGroups(), 'length', 0);
}

/**
 * Action handlers
 */
/** Handles keyboard events while the select is closed. */
function handleClosedKeydown(event) {
  const key = event.key;
  const isArrowKey = ARROW_KEYS.indexOf(key) > -1;
  const isOpenKey = key === ENTER || key === SPACE || key === SPACEBAR;
  const manager = this.keyManager.current;
  
  // Open the select on ALT + arrow key to match the native <select>
  if ((isOpenKey && !hasModifierKey(event)) || ((this.props.multiple || event.altKey) && isArrowKey)) {
    // prevents the page from scrolling down when pressing space
    event.preventDefault();
    this.open();
  } else if (!this.props.multiple) {
    if (key === HOME || key === END) {
      key === HOME ?
        manager.setFirstItemActive() :
        manager.setLastItemActive();
      event.preventDefault();
    } else {
      this.keyManager.current.onKeydown(event);
    }
  }
}

/** Handles keyboard events when the selected is open. */
function handleOpenKeydown(event) {
  const key = event.key;
  const isArrowKey = [ARROW_UP, UP, ARROW_DOWN, DOWN].indexOf(key) > -1;
  const manager = this.keyManager.current;

  if (key === HOME || key === END) {
    // prevent navigation
    event.preventDefault();
    key === HOME ?
      manager.setFirstItemActive() :
      manager.setLastItemActive();
  } else if (isArrowKey && event.altKey) {
    // Close the select on ALT + arrow key to match the native <select>
    event.preventDefault();
    this.close();
  } else if (
    (key === ENTER || key === SPACE || key === SPACEBAR)
    && manager.state.activeItem
    && !hasModifierKey(event)
  ) {
    event.preventDefault();
    manager.state.activeItem.selectViaInteraction();
  } else if (this.props.multiple && key === 'A' && event.ctrlKey) {
    event.preventDefault();
    const options = this.getOptions();
    const hasDeselectedOptions = _.some(
      options,
        option => (
          _.get(option.props, 'selected') === false
          && _.get(option.props, 'disabled') === false
        ),
      );

    options.forEach((option) => {
      if (!_.get(option.props, 'disabled')) {
        hasDeselectedOptions ? option.select() : option.deselect();
      }
    })
  } else {
    const previouslyFocusedIndex = manager.state.activeItemIndex;

    manager.onKeydown(event);
    if (this.props.multiple && isArrowKey && event.shiftKey
      && this.keyManager.current.state.activeItem
      && previouslyFocusedIndex !== this.keyManager.current.state.activeItemIndex
    ) {
      manager.activeItem.selectViaInteraction();
    }
  }
}

/** Sets the checkmark padding size based on width of it */
function setPseudoCheckboxPaddingSize() {
  if (!SELECT_MULTIPLE_PANEL_PADDING_X && this.props.multiple) {
    const pseudoCheckbox = this.PANEL.querySelector('.mat-pseudo-checkbox');
    if (pseudoCheckbox) {
      SELECT_MULTIPLE_PANEL_PADDING_X = SELECT_PANEL_PADDING_X * 1.5 + pseudoCheckbox.offsetWidth;
    }
  }
}

/** Invoked when an option is selected */
function onSelect(option, isUserInput) {
  const value = _.get(option.props, 'value');
  const selectionModel = this.selectionModel.current;
  const wasSelected = selectionModel.isSelected(value);

  if (value === null && !this.props.multiple) {
    option.deselect();
    selectionModel.clear();
    // propagateChanges.call(this, value);
  } else {
    _.get(option.props, 'selected') ?
      selectionModel.select(value) :
      selectionModel.deselect(value);

    if (isUserInput) {
      this.keyManager.current.setActiveItem(option);
    }

    if (this.props.multiple) {
      // sortValues.call(this);

      if (isUserInput) {
        // In case the user selected the option with their mouse, we
        // want to restore focus back to the trigger, in order to
        // prevent the select keyboard controls from clashing with
        // the ones from `mat-option`.
        this.focus();
      }
    }
  }

  if (wasSelected !== selected) {
    this.props.onChange(
      this.props.multiple ?
        [...selectionModel.selected(), value] :
        value
    );
  }
}

/**
 * Handling the positioning, styling
 */
/** Scrolls the active option into view. */
function scrollActiveOptionIntoView() {
  const activeOptionIndex = this.keyManager.current.state.activeItemIndex || 0;
  const labelCount = countGroupLabelsBeforeOption(
    activeOptionIndex, this.getOptions(), this.getOptionGroups()
  );
  
  this.setState(state => ({
    scrollTop: getOptionScrollPosition(
      activeOptionIndex + labelCount,
      ITEM_HEIGHT,
      state.scrollTop,
      SELECT_PANEL_MAX_HEIGHT,
    ),
  }));
}

/** Gets the index of the provided option in the option list. */
function getOptionIndexFromValue(option) {
  return this.getOptions().reduce((result, current, index) => {
    return result === undefined ? (option === _.get(current.props, 'value') ? index : undefined) : result;
  }, undefined);
}

/** Calculates the scroll position and x- and y-offsets of the overlay panel. */
function calculateOverlayPosition() {
  const itemHeight = ITEM_HEIGHT;
  const items = getItemCount.call(this);
  const panelHeight = Math.min(items * itemHeight, SELECT_PANEL_MAX_HEIGHT);
  const scrollContainerHeight = items * itemHeight;
  
  // The farthest the panel can be scrolled before it hits the bottom
  const maxScroll = scrollContainerHeight - panelHeight;
  
  // If no value is selected we open the popup to the first item.
  let selectedOptionOffset;
  const firstSelectionValue = _.head(this.selectionModel.current.selected());
  if (
    this.isEmpty()
    || this.selectionModel.current.isEmpty()
    || firstSelectionValue === null
  ) {
    selectedOptionOffset = 0;
  } else {
    selectedOptionOffset = getOptionIndexFromValue.call(this, _.head(this.selectionModel.current.selected()));
  }

  selectedOptionOffset += countGroupLabelsBeforeOption(
    selectedOptionOffset, this.getOptions(), this.getOptionGroups(),
  );
  
  // We must maintain a scroll buffer so the selected option will be scrolled to the
  // center of the overlay panel rather than the top.
  const scrollBuffer = panelHeight / 2;

  /**
   * Calculate this on the next tick because the component
   * doesn't have access to the panel's DOMRect value upon
   * the first render.
   *
   * Opt to use requestAnimationFrame because setTimeout
   * with a timeout of 0 will still show some panel jump.
   */
  window.requestAnimationFrame(() => {
    this.setState({
      scrollTop: calculateOverlayScroll.call(this, selectedOptionOffset, scrollBuffer, maxScroll),
      offsetY: calculateOverlayOffsetY.call(this, selectedOptionOffset, scrollBuffer, maxScroll),
    }, () => {
      checkOverlayWithinViewport.call(this, maxScroll);
    });
  });
}

/**
 * Calculates the scroll position of the select's overlay panel.
 *
 * Attempts to center the selected option in the panel. If the option is
 * too high or too low in the panel to be scrolled to the center, it clamps the
 * scroll position to the min or max scroll positions respectively.
 */
function calculateOverlayScroll(selectedIndex, scrollBuffer, maxScroll) {
  const itemHeight = ITEM_HEIGHT;
  const optionOffsetFromScrollTop = itemHeight * selectedIndex;
  const halfOptionHeight = itemHeight / 2;
  
  // Starts at the optionOffsetFromScrollTop, which scrolls the option to the top of the
  // scroll container, then subtracts the scroll buffer to scroll the option down to
  // the center of the overlay panel. Half the option height must be re-added to the
  // scrollTop so the option is centered based on its middle, not its top edge.
  const optimalScrollPosition = optionOffsetFromScrollTop - scrollBuffer + halfOptionHeight;
  return Math.min(Math.max(0, optimalScrollPosition), maxScroll);
}

/**
 * Sets the x-offset of the overlay panel in relation to the trigger's top start corner.
 * This must be adjusted to align the selected option text over the trigger text when
 * the panel opens. Will change based on LTR or RTL text direction. Note that the offset
 * can't be calculated until the panel has been attached, because we need to know the
 * content width in order to constrain the panel within the viewport.
 */
function calculateOverlayOffsetX() {
  window.setTimeout(() => {
    const overlayRect = this.PANEL.getBoundingClientRect();
    const viewportSize = this.props.__viewportRuler.getViewportSize();
    const rtl = this.isRtl();
    const paddingWidth = SELECT_PANEL_PADDING_X * 2;

    // Adjust the offset, depending on the option padding.
    let selectedValue = _.head(this.selectionModel.current.selected());
    let selected = _.get(
      selectedValue ? getOptionIndexFromValue(selectedValue) : 0
    );
    let offsetX = selected && !_.isNil(selected.props, 'group') ? SELECT_PANEL_INDENT_PADDING_X : SELECT_PANEL_PADDING_X;

    // Invert the offset in LTR.
    if (!rtl) {
      offsetX *= -1;
    }

    // Determine how much the select overflows on each side.
    const leftOverflow = 0 - (overlayRect.left + offsetX - (rtl ? paddingWidth : 0));
    const rightOverflow = overlayRect.right + offsetX - viewportSize.width
      + (rtl ? 0 : paddingWidth);

    // If the element overflows on either side, reduce the offset to allow it to fit.
    if (leftOverflow > 0) {
      offsetX += leftOverflow + SELECT_PANEL_VIEWPORT_PADDING;
    } else if (rightOverflow > 0) {
      offsetX -= rightOverflow + SELECT_PANEL_VIEWPORT_PADDING;
    }

    // Set the offset directly in order to avoid having to go through change detection and
    // potentially triggering "changed after it was checked" errors. Round the value to avoid
    // blurry content in some browsers.
    this.setState({
      offsetX: Math.round(offsetX),
      // todo: somehow update position
    });

    this.connectedOverlay.current.overlay.current.updatePosition();
  }, 0);
}

/**
 * Calculates the y-offset of the select's overlay panel in relation to the
 * top start corner of the trigger. It has to be adjusted in order for the
 * selected option to be aligned over the trigger when the panel opens.
 */
function calculateOverlayOffsetY(selectedIndex, scrollBuffer, maxScroll) {
  const itemHeight = ITEM_HEIGHT;
  const optionHeightAdjustment = (itemHeight - this.state.triggerRect.height) / 2;
  const maxOptionsDisplayed = Math.floor(SELECT_PANEL_MAX_HEIGHT / itemHeight);
  let optionOffsetFromPanelTop: number;
  
  // Disable offset if requested by user by returning 0 as value to offset
  if (this.props.disableOptionCentering) {
    return 0;
  }
  
  if (this.state.scrollTop === 0) {
    optionOffsetFromPanelTop = selectedIndex * itemHeight;
  } else if (this.state.scrollTop === maxScroll) {
    const firstDisplayedIndex = getItemCount.call(this) - maxOptionsDisplayed;
    const selectedDisplayIndex = selectedIndex - firstDisplayedIndex;
    
    // The first item is partially out of the viewport. Therefore we need to calculate what
    // portion of it is shown in the viewport and account for it in our offset.
    let partialItemHeight =
      itemHeight - (getItemCount.call(this) * itemHeight - SELECT_PANEL_MAX_HEIGHT) % itemHeight;
    
    // Because the panel height is longer than the height of the options alone,
    // there is always extra padding at the top or bottom of the panel. When
    // scrolled to the very bottom, this padding is at the top of the panel and
    // must be added to the offset.
    optionOffsetFromPanelTop = selectedDisplayIndex * itemHeight + partialItemHeight;
  } else {
    // If the option was scrolled to the middle of the panel using a scroll buffer,
    // its offset will be the scroll buffer minus the half height that was added to
    // center it.
    optionOffsetFromPanelTop = scrollBuffer - itemHeight / 2;
  }
  
  // The final offset is the option's offset from the top, adjusted for the height difference,
  // multiplied by -1 to ensure that the overlay moves in the correct direction up the page.
  // The value is rounded to prevent some browsers from blurring the content.
  return Math.round(optionOffsetFromPanelTop * -1 - optionHeightAdjustment);
}

/**
 * Checks that the attempted overlay position will fit within the viewport.
 * If it will not fit, tries to adjust the scroll position and the associated
 * y-offset so the panel can open fully on-screen. If it still won't fit,
 * sets the offset back to 0 to allow the fallback position to take over.
 */
function checkOverlayWithinViewport(maxScroll) {
  const itemHeight = ITEM_HEIGHT;
  const viewportSize = this.props.__viewportRuler.getViewportSize();
  
  const topSpaceAvailable = this.state.triggerRect.top - SELECT_PANEL_VIEWPORT_PADDING;
  const bottomSpaceAvailable =
    viewportSize.height - this.state.triggerRect.bottom - SELECT_PANEL_VIEWPORT_PADDING;
  
  const panelHeightTop = Math.abs(this.state.offsetY);
  const totalPanelHeight =
    Math.min(getItemCount.call(this) * itemHeight, SELECT_PANEL_MAX_HEIGHT);
  const panelHeightBottom = totalPanelHeight - panelHeightTop - this.state.triggerRect.height;
  
  if (panelHeightBottom > bottomSpaceAvailable) {
    adjustPanelUp.call(this, panelHeightBottom, bottomSpaceAvailable);
  } else if (panelHeightTop > topSpaceAvailable) {
    adjustPanelDown.call(this, panelHeightTop, topSpaceAvailable, maxScroll);
  } else {
    this.setState({
      transformOrigin: getOriginBasedOnOption.call(this),
    });
  }
}

/** Adjusts the overlay panel up to fit in the viewport. */
function adjustPanelUp(panelHeightBottom, bottomSpaceAvailable) {
  // Browsers ignore fractional scroll offsets, so we need to round.
  const distanceBelowViewport = Math.round(panelHeightBottom - bottomSpaceAvailable);
  
  // Scrolls the panel up by the distance it was extending past the boundary, then
  // adjusts the offset by that amount to move the panel up into the viewport.
  
  this.setState((state) => {
    const scrollTop = state.scrollTop - distanceBelowViewport;
    const offsetY = state.offsetY - distanceBelowViewport;
    const transformOrigin = getOriginBasedOnOption.call(this);
  
    // If the panel is scrolled to the very top, it won't be able to fit the panel
    // by scrolling, so set the offset to 0 to allow the fallback position to take
    // effect.
    if (scrollTop <= 0) {
      return { scrollTop: 0, offsetY: 0, transformOrigin: '50% bottom 0px' };
    }
    
    return { scrollTop, offsetY, transformOrigin };
  });
}

/** Adjusts the overlay panel down to fit in the viewport. */
function adjustPanelDown(panelHeightTop, topSpaceAvailable, maxScroll) {
  // Browsers ignore fractional scroll offsets, so we need to round.
  const distanceAboveViewport = Math.round(panelHeightTop - topSpaceAvailable);
  
  this.setState((state) => {
    // Scrolls the panel down by the distance it was extending past the boundary, then
    // adjusts the offset by that amount to move the panel down into the viewport.
    const scrollTop = state.scrollTop + distanceAboveViewport;
    const offsetY = state.offsetY + distanceAboveViewport;
    const transformOrigin = getOriginBasedOnOption.call(this);
  
    // If the panel is scrolled to the very bottom, it won't be able to fit the
    // panel by scrolling, so set the offset to 0 to allow the fallback position
    // to take effect.
    if (scrollTop >= maxScroll) {
      return { scrollTop: maxScroll, offsetY: 0, transformOrigin: `50% top 0px` };
    }
    
    return { scrollTop, offsetY, transformOrigin };
  });
}

/** Sets the transform origin point based on the selected option. */
function getOriginBasedOnOption(): string {
  const itemHeight = ITEM_HEIGHT;
  const optionHeightAdjustment = (itemHeight - this.state.triggerRect.height) / 2;
  const originY = Math.abs(this.state.offsetY) - optionHeightAdjustment + itemHeight / 2;
  return `50% ${originY}px 0px`;
}
