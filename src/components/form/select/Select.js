import * as React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import map from 'lodash/map';
import has from 'lodash/has';
import head from 'lodash/head';
import isNil from 'lodash/isNil';
import isEmpty from 'lodash/isEmpty';
import some from 'lodash/some';
import findIndex from 'lodash/findIndex';
import {
  Arrow,
  ArrowWrapper, ITEM_HEIGHT, PANEL_MAX_HEIGHT,
  SelectPlaceholder, SelectTriggerWrapper, SelectValueAsTextWrapper, SelectValueWrapper,
  SelectWrapper, VIEWPORT_BOUNDARY,
} from './styles';
import { PROP_TYPE_STRING_OR_NUMBER } from '../../core/prop-types';
import countGroupLabels from '../../core/options/count-group-labels';
import Portal from '../../portal/Portal';
import Panel from './Panel';
import { ALT, ARROW_KEYS, END, ENTER, HOME, SPACE, SPACEBAR, TAB } from '../../core/keys';
import { withListKeyConsumer, withListKeyProvider } from '../../core/collection/list-key-manager';

class Select extends React.Component {
  constructor() {
    super();
    
    this.state = {
      open: false,
      triggerDimensions: { x: 0, y: 0, height: 0, width: 0, left: 0, top: 0 },
      scrollTop: 0,
      offsetY: 0,
      transformOrigin: 'top',
    };
  }
  
  /*
  Lifecycle
   */
  getSnapshotBeforeUpdate(prevProps, prevState) {
    if (!prevState.open && this.state.open) {
      // if we're opening, recalculate the bounding rectangle
      const parent = this.getOutlineFromRef(this.TRIGGER);
      return parent.getBoundingClientRect();
    }
    
    return null;
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.setState({ triggerDimensions: snapshot });
    }
    
    if (prevState.open === this.state.open) {
      if (this.state.open && (this.state.scrollTop !== prevState.scrollTop)) {
        if (this.props.__listContainerRef) {
          this.props.__listContainerRef.scrollTop = this.state.scrollTop;
        }
      }
    }
  }
  
  /**
   * Refs
   */
  getTriggerRef = (trigger) => {
    this.TRIGGER = trigger;
  };
  
  /*
  Accessibility
   */
  getAriaLabel() {
    return this.props['aria-labelledby'] ? null :
      this.props['aria-label'] || this.props.placeholder;
  }
  
  getAriaLabelledBy() {
    if (this.props['aria-labelledby']) return this.props['aria-labelledby'];
    return this.props.__labelId;
  }
  
  getAriaOwnedOptionIds() {
    if (this.PANEL_LIST.current && this.state.open) {
      return map(this.PANEL_LIST.current.querySelectorAll('[aria-selected="true"]'), node => node.id)
        .join(' ');
    }
    
    return null;
  }
  
  getAriaDescribedBy() {
    return this.props.__describedByIds.join(' ');
  }
  
  getAriaActiveDescendant() {
    if (this.PANEL_LIST.current && this.state.open && this.props.__focused > -1) {
      return this.PANEL_LIST.current.children[this.props.__focused].id;
    }
    
    return null;
  }
  
  /*
  Derived data
   */
  isEmpty = () => {
    return this.props.multiple ? isEmpty(this.props.value) : isNil(this.props.value);
  };
  
  getOptions = () => {
    const children = React.Children.toArray(this.props.children);
    if (some(children, child => get(child, 'props.__SUI_INTERNAL_TYPE') === 'OptGroup' && has(child, 'props.children'))) {
      return children.reduce((acc, child) => {
        const options = React.Children.toArray(get(child, 'props.children'));
        acc = [...acc, ...options];
        return acc;
      }, []);
    }
    
    return children;
  };
  
  getOptionGroups = () => {
    const children = React.Children.toArray(this.props.children);
    if (some(children, child => get(child, 'props.__SUI_INTERNAL_TYPE') === 'OptGroup' && has(child, 'props.children'))) {
      return children;
    }
  
    return [];
  };
  
  getOptionCount = () => {
    return this.getOptions().length + this.getOptionGroups().length;
  };
  
  getSelectedOptionIndices = () => {
    if (this.isEmpty()) return null;
    const options = this.getOptions();
    if (this.props.multiple) {
      return this.props.value.map(val => findIndex(options, option => get(option, 'props.value') === val));
    }
  
    return findIndex(options, option => get(option, 'props.value') === this.props.value);
  };
  
  getSelectedOptions = () => {
    if (this.isEmpty()) return null;
    const options = this.getOptions();
    const indices = this.getSelectedOptionIndices();
    return this.props.multiple ?
      indices.map(index => get(options, index)) :
      get(options, indices);
  };
  
  getFirstSelectedValue = () => (
    this.props.multiple ? head(this.props.value) : this.props.value
  );
  
  getOptionIndex = (value) => (
    findIndex(this.getOptions(), option => get(option, 'props.value') === value)
  );
  
  getOutlineFromRef = (element) => {
    while (element.parentNode) {
      element = element.parentNode;
      if (element.dataset.suiRole === 'field') return element;
    }
    
    return null;
  };
  
  /*
  The panel
   */
  onToggle = () => {
    this.state.open ? this.onClose() : this.onOpen();
  };
  
  onOpen = () => {
    if (this.disabled || !this.props.children || this.getOptionCount() === 0 || this.state.open) {
      return;
    }
  
    this.setState({ open: true }, () => {
      this.calculateOverlayPosition();
      this.onHighlightCorrectOption();
    });
  };
  
  onClose = () => {
    this.setState({
      open: false,
      scrollTop: 0,
    }, () => {
      if (this.TRIGGER) {
        this.TRIGGER.focus();
      }
    });
  };
  
  onTabOut = () => {
    if (this.state.open) {
      this.onClose();
    }
  };
  
  calculateOverlayPosition = () => {
    const items = this.getOptionCount();
    const scrollContainerHeight = items * ITEM_HEIGHT;
    const panelHeight = Math.min(scrollContainerHeight, PANEL_MAX_HEIGHT);
    
    // farthest panel can scroll down
    const maxScroll = scrollContainerHeight - panelHeight;
    let selectedOptionOffset = this.isEmpty() ?
      0 :
      this.getOptionIndex(this.getFirstSelectedValue());
    
    selectedOptionOffset += countGroupLabels(selectedOptionOffset, this.getOptions(), this.getOptionGroups());
    
    const scrollBuffer = panelHeight / 2;
    this.setState({
      scrollTop: this.calculateOverlayScroll(selectedOptionOffset, scrollBuffer, maxScroll),
    }, () => {
      this.setState({ offsetY: this.calculateOverlayOffsetY(selectedOptionOffset, scrollBuffer, maxScroll) }, () => {
        this.checkOverlayWithinViewport(maxScroll);
      });
    });
  };
  
  /*
  Scroll position of the overlay
  - tries to center it
  - too high or too low? then clamps it within the maximum scrolling range
   */
  calculateOverlayScroll = (selected, buffer, max) => {
    const optionOffsetFromScrollTop = ITEM_HEIGHT * selected;
    const halfOptionHeight = ITEM_HEIGHT / 2;
    
    // Starts at the optionOffsetFromScrollTop, which scrolls the option to the top of the
    // scroll container, then subtracts the scroll buffer to scroll the option down to
    // the center of the overlay panel. Half the option height must be re-added to the
    // scrollTop so the option is centered based on its middle, not its top edge.
    const optimalScrollPosition = optionOffsetFromScrollTop - buffer + halfOptionHeight;
    return Math.min(Math.max(0, optimalScrollPosition), max) + 1;
  };

  /*
  Calculate the y offset of the overlay in relation to the top of the trigger
  - must be adjusted to have the selected option aligned over the trigger
   */
  calculateOverlayOffsetY = (selected, buffer, max) => {
    const optionHeightAdjustment = (ITEM_HEIGHT - this.state.triggerDimensions.height) / 2;
    const maxOptionsDisplayed = Math.floor(PANEL_MAX_HEIGHT / ITEM_HEIGHT);
    let optionOffsetFromPanelTop = 0;

    // Disable offset if requested by user by returning 0 as value to offset
    if (this.props.disableOptionCentering) {
      return 0;
    }
    
    if (this.state.scrollTop <= 1) {
      optionOffsetFromPanelTop = selected * ITEM_HEIGHT;
    } else if (this.state.scrollTop === max) {
      const firstDisplayedIndex = this.getOptionCount() - maxOptionsDisplayed;
      const selectedDisplayIndex = selected - firstDisplayedIndex;

      // The first item is partially out of the viewport. Therefore we need to calculate what
      // portion of it is shown in the viewport and account for it in our offset.
      const partialItemHeight =
        ITEM_HEIGHT - (this.getOptionCount() * ITEM_HEIGHT - PANEL_MAX_HEIGHT) % ITEM_HEIGHT;

      // Because the panel height is longer than the height of the options alone,
      // there is always extra padding at the top or bottom of the panel. When
      // scrolled to the very bottom, this padding is at the top of the panel and
      // must be added to the offset.
      optionOffsetFromPanelTop = selectedDisplayIndex * ITEM_HEIGHT + partialItemHeight;
    } else {
      // If the option was scrolled to the middle of the panel using a scroll buffer,
      // its offset will be the scroll buffer minus the half height that was added to
      // center it.
      optionOffsetFromPanelTop = buffer - ITEM_HEIGHT / 2;
    }

    // The final offset is the option's offset from the top, adjusted for the height difference,
    // multiplied by -1 to ensure that the overlay moves in the correct direction up the page.
    // The value is rounded to prevent some browsers from blurring the content.
    return Math.round(optionOffsetFromPanelTop * -1 - optionHeightAdjustment);
  };
  
  checkOverlayWithinViewport = (scroll) => {
    const itemHeight = ITEM_HEIGHT;
    const viewportSize = window !== undefined ?
      { width: window.innerWidth, height: window.innerHeight } :
      { width: 0, height: 0 };
  
    const topSpaceAvailable = this.state.triggerDimensions.top - VIEWPORT_BOUNDARY;
    const bottomSpaceAvailable =
      viewportSize.height - this.state.triggerDimensions.bottom - VIEWPORT_BOUNDARY;
    
    const panelHeightTop = Math.abs(this.state.offsetY);
    const totalPanelHeight =
      Math.min(this.getOptionCount() * itemHeight, PANEL_MAX_HEIGHT);
    const panelHeightBottom = totalPanelHeight - panelHeightTop - this.state.triggerDimensions.height;
    if (panelHeightBottom > bottomSpaceAvailable) {
      this.adjustPanelUp(panelHeightBottom, bottomSpaceAvailable);
    } else if (panelHeightTop > topSpaceAvailable) {
      this.adjustPanelDown(panelHeightTop, topSpaceAvailable, scroll);
    } else {
      this.setState({
        transformOrigin: this.getOriginBasedOnOption(),
      });
    }
  };
  
  // Adjust it up to fit panel in viewport
  adjustPanelUp = (panelHeightBottom, bottomSpaceAvailable) => {
    const distanceBelowViewport = Math.round(panelHeightBottom - bottomSpaceAvailable);
    
    this.setState((state) => {
      // Scrolls the panel up by the distance it was extending past the boundary, then
      // adjusts the offset by that amount to move the panel up into the viewport.
      const { scrollTop, offsetY } = state;
      const newScrollTop = scrollTop - distanceBelowViewport;
      
      // If the panel is scrolled to the very top, it won't be able to fit the panel
      // by scrolling, so set the offset to 0 to allow the fallback position to take
      // effect.
      if (newScrollTop <= 0) return { scrollTop: 0, offsetY: 0, transformOrigin: '50% bottom 0px' };
      
      const newOffsetY = offsetY - distanceBelowViewport;
      return { scrollTop: newScrollTop, offsetY: newOffsetY, transformOrigin: this.getOriginBasedOnOption() };
    })
  };
  
  /** Adjusts the overlay panel down to fit in the viewport. */
  adjustPanelDown = (panelHeightTop, topSpaceAvailable, maxScroll) => {
    // Browsers ignore fractional scroll offsets, so we need to round.
    const distanceAboveViewport = Math.round(panelHeightTop - topSpaceAvailable);
    
    // Scrolls the panel down by the distance it was extending past the boundary, then
    // adjusts the offset by that amount to move the panel down into the viewport.
    
    this.setState((state) => {
      const { scrollTop, offsetY } = state;
      const newScrollTop = scrollTop + distanceAboveViewport;
  
  
      // If the panel is scrolled to the very bottom, it won't be able to fit the
      // panel by scrolling, so set the offset to 0 to allow the fallback position
      // to take effect.
      if (newScrollTop >= maxScroll) return { scrollTop: maxScroll, offsetY: 0, transformOrigin: '50% top 0px' };
      
      const newOffsetY = offsetY + distanceAboveViewport;
      return { scrollTop: newScrollTop, offsetY: newOffsetY, transformOrigin: this.getOriginBasedOnOption() };
    });
  };
  
  /** Sets the transform origin point based on the selected option. */
  getOriginBasedOnOption = () => {
    const optionHeightAdjustment = (ITEM_HEIGHT - this.state.triggerDimensions.height) / 2;
    const originY = Math.abs(this.state.offsetY) - optionHeightAdjustment + ITEM_HEIGHT / 2;
    return `50% ${originY}px 0px`;
  };
  
  onHighlightCorrectOption = () => {
    if (this.isEmpty()) {
      this.props.__onSetFirstItemActive();
    } else {
      this.props.__onSetActiveIndex(this.getOptionIndex(this.getFirstSelectedValue()));
    }
  };
  
  /*
  Event listeners
   */
  handleClosedKeyDown = (event) => {
    const key = event.key;
    const isArrowKey = ARROW_KEYS.indexOf(key) > -1;
    const isOpenKey = key === ENTER || key === SPACE || key === SPACEBAR;
    
    if (isOpenKey || ((this.props.multiple || key === ALT) && isArrowKey)) {
      event.preventDefault(); // don't navigate
      this.onOpen();
    } else if (!this.props.multiple) {
      this.props.__onKeyDown(event);
    }
  };
  
  handleOpenKeyDown = (event) => {
    const key = event.key;
    const isArrowKey = ARROW_KEYS.indexOf(key) > -1;
    const isOpenKey = key === ENTER || key === SPACE || key === SPACEBAR;
    
    if (key === HOME || key === END) {
      event.preventDefault();
      key === HOME ? this.props.__onSetFirstItemActive() : this.props.__onSetLastItemActive();
    } else if (isArrowKey && event.altKey) {
      event.preventDefault();
      this.onClose();
    } else if ((key === ENTER || key === SPACE) && this.props.__focused > -1) {
      // TODO: key manager
      event.preventDefault();
      this.props.onChange(get(this.getOptions(), [this.props.__focused, 'props', 'value']));
    } else if (this.props.multiple && key === 'A' && event.ctrlKey) {
      // select all
      event.preventDefault();
      const allValues = this.getOptions().map(child => child.props.value);
      const hasDeselectedOptions = this.props.value.length < allValues.length;
      this.props.onChange({
        added: hasDeselectedOptions ? allValues : [],
        removed: hasDeselectedOptions ? [] : allValues,
      });
    } else {
      const previouslyFocused = this.props.__focused;
      if (key === TAB) {
        // we don't want to move focus to the next element, but rather the trigger
        event.preventDefault();
      }
      
      this.props.__onKeyDown(event);
      // todo
    }
  };
  
  handleKeyDown = (event) => {
    if (!this.props.disabled) {
      this.state.open ? this.handleOpenKeyDown(event) : this.handleClosedKeyDown(event);
    }
  };
  
  /*
  Rendering
   */
  
  getTriggerValue() {
    if (this.isEmpty()) return '';
    const selected = this.getSelectedOptions();
    if (this.props.multiple) {
      const optionsAsText = selected.map(option => get(option, 'props.label'));
      
      // TODO: RTL
      
      // TODO: delimiter for localization
      return optionsAsText.join(', ');
    }
    
    return get(selected, 'props.label');
  }
  
  renderTrigger() {
    if (this.isEmpty()) return <SelectPlaceholder>{ this.props.placeholder || '\u00a0' }</SelectPlaceholder>;
    return !!this.props.trigger ?
      this.props.trigger :
      <SelectValueAsTextWrapper>{ this.getTriggerValue() }</SelectValueAsTextWrapper>;
  }
  
  render() {
    const { __labelId, __describedByIds, required, disabled, multiple, compareWith, value, trigger, disableOptionCentering, ...restProps } = this.props;
    return (
      <React.Fragment>
        <SelectWrapper
          {...restProps}
          onKeyDown={this.handleKeyDown}
          tabIndex={restProps.tabIndex || 0}
          onClick={this.onToggle}
          role={'listbox'}
          aria-label={this.getAriaLabel()}
          aria-labelledby={this.getAriaLabelledBy()}
          aria-required={this.props.required}
          aria-disabled={this.props.disabled}
          aria-invalid={this.props.error}
          aria-owns={this.getAriaOwnedOptionIds()}
          aria-multiselectable={this.props.multiple}
          aria-describedby={this.getAriaDescribedBy()}
          aria-activedescendant={this.getAriaActiveDescendant()}
          innerRef={this.getTriggerRef}
        >
          <SelectTriggerWrapper aria-hidden={true}>
            <SelectValueWrapper>
              { this.renderTrigger() }
            </SelectValueWrapper>
            <ArrowWrapper>
              <Arrow data-state={this.state.open ? 'open' : 'closed'} height={16} width={16} />
            </ArrowWrapper>
          </SelectTriggerWrapper>
        </SelectWrapper>
        <Portal
          scrollStrategy={'block'}
          width={this.state.triggerDimensions.width}
          top={this.state.triggerDimensions.top}
          left={this.state.triggerDimensions.left}
          origin={this.state.transformOrigin}
          offsetY={this.state.offsetY}
          open={this.state.open}
          onClose={this.onClose}
          onOpen={this.onOpen}
          onBackdropClick={this.onClose}
          onKeyDown={this.handleKeyDown}
        >
          <Panel
            multiple={this.props.multiple}
            selection={this.props.value}
            onTabOut={this.onTabOut}
          >
            { this.props.children }
          </Panel>
        </Portal>
      </React.Fragment>
    )
  }
}

Select.propTypes = {
  // from context
  __labelId: PROP_TYPE_STRING_OR_NUMBER,
  __describedByIds: PropTypes.arrayOf(PROP_TYPE_STRING_OR_NUMBER),
  placeholder: PROP_TYPE_STRING_OR_NUMBER,
  onChange: PropTypes.func,
  required: PropTypes.bool,
  multiple: PropTypes.bool,
  compareWith: PropTypes.func, // compares options with selected values
  value: PropTypes.any,
  disabled: PropTypes.bool,
  trigger: PropTypes.node,
  disableOptionCentering: PropTypes.bool,
  'aria-label': PropTypes.string,
  'aria-labelledby': PropTypes.string,
};

Select.defaultProps = {
  // from context
  __labelId: '',
  __describedByIds: [],
  placeholder: '',
  onChange: console.log,
  required: false,
  multiple: false,
  compareWith: PropTypes.func, // compares options with selected values
  value: undefined,
  disabled: false,
  trigger: null,
  disableOptionCentering: false,
  'aria-label': null,
  'aria-labelledby': null,
};

export default withListKeyProvider(withListKeyConsumer(Select));
