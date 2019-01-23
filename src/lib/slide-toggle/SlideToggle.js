import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  SlideToggleBar, SlideToggleContent, SlideToggleInput, SlideToggleLabel, SlideToggleRoot, SlideToggleThumb,
  SlideToggleThumbContainer,
} from './styles/index';
import { FocusMonitorDefaultProps, FocusMonitorPropTypes } from '../../cdk/a11y';
import { withFocusMonitor } from '../../cdk/a11y/focus-monitor/FocusMonitor';

class SlideToggle extends React.Component {
  constructor() {
    super();
    
    this.state = {
      /** Whether the thumb is currently being dragged. */
      dragging: false,
      /** Previous checked state before drag started. */
      previousChecked: null,
      /** Percentage of the thumb while dragging. Percentage as fraction of 100. */
      dragBarPercentage: 0,
      /** Width of the thumb bar of the slide-toggle. */
      thumbBarWidth: 0,
      /** Track the x, y for drag events (initial) */
      initialTouchPosition: null,
      /** Track the x, y for drag events (last) */
      lastTouchPosition: null,
      /** drag position */
      dragX: null,
    };
    
    /*
    Depending on if the browser supports pointer events,
    we have a different set of event listeners to apply
    to the base element.
    
    The shotgun option of adding all event listeners (both
    for supported and unsupported) will trigger events
    to fire twice.
     */
    this.EVENT_LISTENERS = {};
    
    this.DEFAULT_ID = _.uniqueId('sui-slide-toggle:');
  }
  
  /**
   * Lifecycle
   */
  componentDidMount() {
    this.EVENT_LISTENERS = window.PointerEvent ? {
      onPointerDown: this.onDragStart,
      onPointerMove: this.onDragMove,
      onPointerUp: this.onDragEnd,
      onPointerCancel: this.onDragEnd,
    } : {
      onTouchStart: this.onDragStart,
      onMouseDown: this.onDragStart,
      onTouchMove: this.onDragMove,
      onTouchEnd: this.onDragEnd,
      onTouchCancel: this.onDragEnd,
    };
  }
  
  componentWillUnmount() {
    this.props.__focusMonitor.stopMonitoring(this.TOGGLE_ROOT);
  }
  
  /**
   * Refs
   */
  /** Get the toggle root and monitor it */
  getToggleRoot = (root) => {
    this.TOGGLE_ROOT = root;
    if (root) {
      this.props.__focusMonitor.monitor({
        element: root,
        checkChildren: true,
        callback: handleOnFocus.bind(this),
      });
    }
  };
  
  /** Get the native input element */
  getInputRef = (input) => {
    this.INPUT = input;
  };
  
  /** Get the thumb container */
  getThumbContainerRef = (thumbContainer) => {
    this.THUMB_CONTAINER = thumbContainer;
  };
  
  /** Get the toggle bar */
  getToggleBarRef = (toggleBar) => {
    this.TOGGLE_BAR = toggleBar;
  };
  
  /** Get the label content ref */
  getLabelContentRef = (labelContent) => {
    this.LABEL_CONTENT = labelContent;
  };
  
  /**
   * Derived data
   */
  /** Final ID for the slide toggle */
  getId = () => this.props.id || this.DEFAULT_ID;
  
  /** ID for the input el */
  getInputId = () => `${this.getId()}-input`;
  
  /** Tab index for the input el */
  getTabIndex = () => this.props.tabIndex || 0;
  
  /** Getter function to see if there is any label content */
  hasLabelContent = () => {
    if (!this.LABEL_CONTENT) return false;
    return !this.LABEL_CONTENT.textContent
      || !this.LABEL_CONTENT.textContent.trim();
  };
  
  /**
   * Actions
   */
  /** Focus handler---focus checkbox */
  focus = () => {
    if (this.INPUT) {
      this.INPUT.focus();
    }
  };
  
  /** Method being called whenever the underlying input emits a change event. */
  inputChangeEvent = (event) => {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the component's `change` output.
    event.stopPropagation();
    this.props.onChange(event);
  };
  
  /** Method being called whenever the slide-toggle has been clicked. */
  inputClickEvent = (event) => {
    // We have to stop propagation for click events on the visual hidden input element.
    // By default, when a user clicks on a label element, a generated click event will be
    // dispatched on the associated input element. Since we are using a label element as our
    // root container, the click event on the `slide-toggle` will be executed twice.
    // The real click event will bubble up, and the generated click event also tries to bubble up.
    // This will lead to multiple click events.
    // Preventing bubbling for the second event will solve that issue.
    event.stopPropagation();
  };
  
  /**
   * Swipe listeners based on here (without using HammerJS):
   * https://developers.google.com/web/fundamentals/design-and-ux/input/touch/
   */
  /** Dragging start */
  onDragStart = (event) => {
    event.preventDefault();
  
    if (event.touches && _.get(event.touches, 'length', 1) > 1) {
      return;
    }
    // set up the move and end listeners
    if (window.PointerEvent) {
      /*
      If we have PointerEvents in the window, then we can
      use the setPointerCapture API
       */
      event.target.setPointerCapture(event.pointerId);
    } else {
      /*
      Otherwise, we'll have to bind mousemove and mouseup
      listeners to the document if the user moves the mouse
      outside of the slide toggle area
       */
      document.addEventListener('mousemove', this.onDragMove, true);
      document.addEventListener('mouseup', this.onDragEnd, true);
    }
    
    // handle dragging logic
    if (!this.props.disabled && !this.state.dragging) {
      this.setState({
        initialTouchPosition: getGesturePointFromEvent.call(this, event),
        thumbBarWidth: this.TOGGLE_BAR.clientWidth - this.THUMB_CONTAINER.clientWidth,
        dragging: true,
        previousChecked: this.props.checked,
      });
    }
  };
  
  onDragMove = (event) => {
    if (this.state.dragging) {
      event.persist();
      this.setState((state) => {
        const lastTouchPosition = getGesturePointFromEvent.call(this, event);
        const deltaX = state.initialTouchPosition.x - lastTouchPosition.x;
        const newTransform = ((state.dragX / state.thumbBarWidth) * 100) - deltaX;
        const dragPercentage = getDragPercentage.call(this, newTransform);
        return {
          lastTouchPosition,
          // Calculate the moved distance based on the thumb bar width.
          dragX: (dragPercentage / 100) * state.thumbBarWidth,
        };
      });
    }
  };
  
  onDragEnd = (event) => {
    if (this.state.dragging) {
      const newCheckedValue = this.state.dragBarPercentage > 50;
      
      if (newCheckedValue !== this.props.checked) {
        // todo
      }
    }
    if (window.PointerEvent) {
      event.target.releasePointerCapture(event.pointerId);
    } else {
      document.removeEventListener('mousemove', this.onDragMove, true);
      document.removeEventListener('mouseup', this.onDragEnd, true);
    }
  
    /*
    Reset the transform because the component will take care
    of the thumb position after drag.
     */
    this.setState({
      initialTouchPosition: null,
      dragging: false,
      dragX: null,
    })
  };
  
  render() {
    const {
      name,
      id,
      labelPosition,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      required,
      checked,
      disabled,
      onChange,
      onTouched,
      tabIndex,
      __focusMonitor,
      ...restProps
    } = this.props;
    return (
      // Needs to be `-1` so it can still receive programmatic focus.
      <SlideToggleRoot
        {...restProps}
        tabIndex={-1}
        onFocus={this.focus}
        data-dragging={this.state.dragging}
        data-disabled={disabled}
        data-checked={checked}
        data-label-before={labelPosition === 'before'}
        data-label-empty={!this.hasLabelContent()}
        innerRef={this.getToggleRoot}
      >
        <SlideToggleLabel>
          <SlideToggleBar
            innerRef={this.getToggleBarRef}
          >
            <SlideToggleInput
              id={this.getInputId()}
              type="checkbox"
              required={required}
              tabIndex={this.getTabIndex()}
              checked={checked}
              disabled={disabled}
              name={name}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              onChange={this.inputChangeEvent}
              onClick={this.inputClickEvent}
              innerRef={this.getInputRef}
            />
            <SlideToggleThumbContainer
              {...this.EVENT_LISTENERS}
              style={{
                transform: this.state.dragX !== null ?
                  `translate3d(${this.state.dragX}px, 0, 0)` :
                  null
              }}
              innerRef={this.getThumbContainerRef}
            >
              <SlideToggleThumb />
            </SlideToggleThumbContainer>
          </SlideToggleBar>
          <SlideToggleContent innerRef={this.getLabelContentRef}>
            { this.props.children }
          </SlideToggleContent>
        </SlideToggleLabel>
      </SlideToggleRoot>
    );
  }
}

const SlideTogglePropTypes = {
  /** Name value will be applied to the input element if present. */
  name: PropTypes.string,
  /** A unique id for the slide-toggle input. If none is supplied, it will be auto-generated. */
  id: PropTypes.string,
  /** Whether the label should appear after or before the slide-toggle. Defaults to 'after'. */
  labelPosition: PropTypes.oneOf(['before', 'after']),
  /** Used to set the aria-label attribute on the underlying input element. */
  'aria-label': PropTypes.string,
  /** Used to set the aria-labelledby attribute on the underlying input element. */
  'aria-labelledby': PropTypes.string,
  /** Whether the slide-toggle is required. */
  required: PropTypes.bool,
  /** Whether the slide-toggle element is checked or not. */
  checked: PropTypes.bool,
  /** Whether the slide-toggle element is disabled or not. */
  disabled: PropTypes.bool,
  /** An event will be dispatched each time the slide-toggle changes its value. */
  onChange: PropTypes.func,
  /** An event will be dispatched when we touch the input element. */
  onTouched: PropTypes.func,
  /** Tab index for the native input */
  tabIndex: PropTypes.number,
};

const SlideToggleDefaultProps = {
  name: null,
  id: null,
  labelPosition: 'after',
  'aria-label': null,
  'aria-labelledby': null,
  disabled: false,
  required: false,
  checked: false,
  onChange: _.noop,
  onTouched: _.noop,
  tabIndex: 0,
};

SlideToggle.propTypes = {
  ...SlideTogglePropTypes,
  __focusMonitor: FocusMonitorPropTypes,
};

SlideToggle.defaultProps = {
  ...SlideToggleDefaultProps,
  __focusMonitor: FocusMonitorDefaultProps,
};

const StackedSlideToggle = withFocusMonitor(SlideToggle);

StackedSlideToggle.propTypes = SlideTogglePropTypes;
StackedSlideToggle.defaultProps = SlideToggleDefaultProps;

export default StackedSlideToggle;

/**
 * Private methods
 */
function handleOnFocus(origin) {
  if (!origin) {
    // When a focused element becomes disabled, the browser *immediately* fires a blur event.
    // Angular does not expect events to be raised during change detection, so any state
    // change (such as a form control's 'ng-touched') will cause a changed-after-checked
    // error. See https://github.com/angular/angular/issues/17793. To work around this,
    // we defer telling the form control it has been touched until the next tick.
    _.defer(() => {
      this.props.onTouched();
    });
  }
}

/** Retrieves the percentage of thumb from the moved distance. Percentage as fraction of 100. */
function getDragPercentage(distance) {
  let percentage = (distance / this.state.thumbBarWidth) * 100;
  if (this.state.previousChecked) {
    percentage += 100;
  }
  
  return _.clamp(percentage, 0, 100);
}

/** Get the x, y coordinates from the touch events */
function getGesturePointFromEvent(event) {
  const point = {};
  
  if (event.targetTouches) {
    // Prefer Touch Events
    point.x = event.targetTouches[0].clientX;
    point.y = event.targetTouches[0].clientY;
  } else {
    // Either Mouse event or Pointer Event
    point.x = event.clientX;
    point.y = event.clientY;
  }
  
  return point;
}
