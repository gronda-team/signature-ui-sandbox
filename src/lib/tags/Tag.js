import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import TagRoot, { TagClose } from './styles/index';
import {
  ListKeyManagerDefaultProps, ListKeyManagerPropTypes,
  withListKeyConsumer,
} from '../../cdk/a11y/key-manager/list-key-manager';
import { BACKSPACE, DELETE, SPACE, SPACEBAR } from '../../cdk/keycodes/keys';
import {
  SelectionModelDefaultProps, SelectionModelPropTypes,
  withSelectionModelConsumer,
} from '../../cdk/collections/selection-model';
import { byInternalType, stack } from '../core/components/util';
import { TagListContextDefaultProps, TagListContextPropTypes, withTagListConsumer } from './context';
import Close from '../core/icons/Close';

class Tag extends React.Component {
  constructor() {
    super();
    
    this.state = {
      /*
      We have to keep hasFocus in state here because Tag.focus is both programmatic
      (triggered via keyManager) and also a listener. If Tag.focus is called, then
      it will trigger the same function twice.
       */
      hasFocus: false,
    };
    
    this.DEFAULT_ID = _.uniqueId('sui-tag:');
  }
  /**
   * Lifecycle
   */
  componentDidMount() {
    this.props.__tagList.changeDescribedByIds({
      added: this.getId(),
    });
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.__keyManager.activeItemIndex !== this.props.__keyManager.activeItemIndex) {
      const activeItem = this.props.__keyManager.activeItem;
      if (_.get(activeItem, 'props.value') === this.props.value) {
        // if the newly focused item is this current Tag, then focus this tag
        this.focus();
      }
    }
    
    // check the ID
    if (this.getId(prevProps) !== this.getId()) {
      this.props.__tagList.changeDescribedByIds({
        added: this.getId(),
        removed: this.getId(prevProps),
      });
    }
  }
  
  componentWillUnmount() {
    // remove the describedById
    this.props.__tagList.changeDescribedByIds({
      removed: this.getId(),
    });
  }
  
  /**
   * Refs
   */
  getTagRoot = (tag) => {
    this.TAG = tag;
  };
  
  /**
   * Derived data
   */
  getId = (props = this.props) => props.id || this.DEFAULT_ID;
  
  getAriaSelected = () => (
    this.getFinalSelectable() ?
      this.props.selected.toString() :
      null
  );
  
  /** Get final selectable state based on own props and parent tag list */
  getFinalSelectable = () => this.props.selectable && this.props.__tagList.selectable;
  
  /** Get final disabled state based on own props and parent tag list */
  getFinalDisabled = () => this.props.disabled || this.props.__tagList.disabled;
  
  /**
   * Actions, listeners
   */
  /**
   * Allows for programmatic removal of the tag. Called by the TagList when the DELETE or
   * BACKSPACE keys are pressed.
   *
   * Informs any listeners of the removal request. Does not remove the tag from the DOM.
   */
  remove = () => {
    if (this.props.removable) {
      this.props.onRemove({
        value: this.props.value,
        tag: this.TAG,
      });
    }
  };
  
  /** Handles click events on the tag. */
  onClick = (event) => {
    if (this.getFinalDisabled()) {
      event.preventDefault();
    } else {
      event.stopPropagation();
    }
    event.persist();
    if (_.isFunction(this.props.onClick)) {
      this.props.onClick(event);
    }
  };
  
  /** Calls the parent tag's public `remove()` method if applicable. */
  handleCloseClick = (event) => {
    this.remove();
  
    // We need to stop event propagation because otherwise the event will bubble up to the
    // form field and cause the `onContainerClick` method to be invoked. This method would then
    // reset the focused tag that has been focused after tag removal. Usually the parent
    // the parent click listener of the `Tag` would prevent propagation, but it can happen
    // that the tag is being removed before the event bubbles up.
    event.stopPropagation();
  };
  
  /** Allows for programmatic focusing of the tag. */
  focus = () => {
    if (!this.state.hasFocus && this.TAG) {
      /*
      call it programmatically because the tabIndex is -1 (does not receive
      natural focus from tab, but can receive focus when .focus() is called)
       */
      this.TAG.focus();
      if (_.isFunction(this.props.onFocus)) {
        this.props.onFocus();
      }
    }
    this.setState({ hasFocus: true });
  };
  
  /** Allows for programmatic blurring of the tag. */
  blur = (event) => {
    // When animations are enabled, the tag may be removed a tad earlier.
    // To work around the issue, we defer marking the tag as not focused
    // until the next time the zone stabilizes.
    _.defer(() => {
      this.setState({ hasFocus: false });
      if (_.isFunction(this.props.onBlur)) {
        this.props.onBlur(event);
      }
    });
  };
  
  /** Handle custom key presses. */
  onKeyDown = (event) => {
    if (this.getFinalDisabled()) return;
    const key = event.key;
    switch (key) {
      case DELETE:
      case BACKSPACE:
        // If we are removable, remove the focused tag
        this.remove();
        // Always prevent so page navigation does not occur
        event.preventDefault();
        break;
      case SPACEBAR:
      case SPACE:
        if (this.getFinalSelectable()) {
          this.props.__selectionModel.toggle(this.props.value);
        }
  
        // Always prevent space from scrolling the page since the list has focus
        event.preventDefault();
        break;
    }
    
    if (_.isFunction(this.props.onKeyDown)) {
      this.props.onKeyDown(event);
    }
  };
  
  render() {
    const {
      value,
      selectable,
      removable,
      disabled,
      onSelectionChange,
      onRemove,
      __keyManager,
      __selectionModel,
      __tagList,
      ['__sui-internal-type']: SIT,
      ...restProps
    } = this.props;
    
    const finalDisabled = this.getFinalDisabled();
    
    return (
      /*
      Tab index must be -1 because we don't want to trap focus here. We want this
      to be keyboard navigable without the user having to tab through a long
      list, for instance.
       */
      <TagRoot
        {...restProps}
        role="option"
        data-sui-type={'tag'}
        data-has-trailing-icon={removable}
        tabIndex={finalDisabled ? null : -1}
        disabled={finalDisabled || null}
        aria-disabled={finalDisabled}
        aria-selected={this.getAriaSelected()}
        onClick={this.onClick}
        onFocus={this.focus}
        onBlur={this.blur}
        onKeyDown={this.onKeyDown}
        innerRef={this.getTagRoot}
      >
        { this.props.children }
        { removable ? (
          <TagClose onClick={this.handleCloseClick} />
        ) : null }
      </TagRoot>
    );
  }
}

const TagPropTypes = {
  /** The value of the tag. Defaults to the content inside the tags. */
  value: PropTypes.any,
  /**
   * Whether or not the tag is selectable. When a tag is not selectable,
   * changes to its selected state are always ignored. By default a tag is
   * selectable, and it becomes non-selectable if it's parent tag list is
   * not selectable.
   */
  selectable: PropTypes.bool,
  /**
   * Determines whether or not the tag displays the remove styling and emits (removed) events.
   */
  removable: PropTypes.bool,
  /** Called when the tag is selected or deselected. */
  onSelectionChange: PropTypes.func,
  /** Called when the tag is removed. */
  onRemove: PropTypes.func,
};

const TagDefaultProps = {
  /** Internal type for identification */
  '__sui-internal-type': 'Tag',
  value: null,
  selectable: false,
  removable: false,
  onSelectionChange: _.noop,
  onRemove: _.noop,
};

Tag.propTypes = {
  ...TagPropTypes,
  __keyManager: ListKeyManagerPropTypes,
  __selectionModel: SelectionModelPropTypes,
  __tagList: TagListContextPropTypes,
};

Tag.defaultProps = {
  ...TagDefaultProps,
  __keyManager: ListKeyManagerDefaultProps,
  __selectionModel: SelectionModelDefaultProps,
  __tagList: TagListContextDefaultProps,
};

const StackedTag = stack(
  withTagListConsumer,
  withListKeyConsumer,
  withSelectionModelConsumer,
)(Tag);

StackedTag.displayName = 'Tag';
StackedTag.propTypes = TagPropTypes;
StackedTag.defaultProps = TagDefaultProps;

export default StackedTag;
