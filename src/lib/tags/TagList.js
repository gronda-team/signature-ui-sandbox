import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { ListKeyManager } from '../../cdk/a11y';
import { SelectionModel } from '../../cdk/collections';
import { BACKSPACE, END, HOME } from '../../cdk/keycodes/keys';
import { FormFieldDefaultProps, FormFieldPropTypes, withFormFieldConsumer } from '../form-field';
import { TagListProvider } from './context/TagListContext';
import { TagListRoot } from './styles/index';
import { byInternalType, stack, toValue } from '../core/components/util';
import { TagInputProvider } from './context/TagListInputContext';

const toArray = React.Children.toArray;
const count = React.Children.count;
class TagList extends React.Component {
  constructor() {
    super();
    
    this.state = {
      /**
       * When a tag is destroyed, we store the index of the destroyed tag until the tags
       * query list notifies about the update. This is necessary because we cannot determine an
       * appropriate tag that should receive focus until the array of tags updated completely.
       */
      lastDestroyedTagIndex: null,
      /** Intermediate tab index when we're tabbing out */
      tabIndex: null, // null or number
      tagFocusValue: null, // value of currently focused tag
      /*
      describedByIds for each tag.
      Note that we can't get the ID from Tag.props.id because the tag
      may use Tag.DEFAULT_ID. So we must manually register them here
       */
      describedByIds: [],
      /** The input extension connected to this tag list */
      inputExtension: null,
      /** Set the form field properties when it mounts */
      setFormFieldProperties: false,
      /** Tag input information */
      __tagInput: { // TagList is the consumer
        id: null,
        placeholder: '',
        getFocused: _.noop,
        isEmpty: null,
        focus: _.noop,
      },
      __tagInputProvider: { // TagInput is the provider (of getters and w/e)
        setTagInputState: this.setTagInputState,
        keydown: this.keyDown,
        isFocused: this.getFocused,
        blur: this.blur,
      },
    };
    
    this.DEFAULT_ID = _.uniqueId('sui-tag-list:');
    this.handleTabOut = handleTabOut.bind(this);
    // Refs
    this.selectionModel = React.createRef();
    this.keyManager = React.createRef();
  }
  
  /**
   * Lifecycle
   */
  componentDidUpdate(prevProps, prevState) {
    /** Do one time setup for when formFieldControl mounts */
    if (!this.state.setFormFieldProperties) {
      /** Set the onContainerClick fn */
      this.props.__formFieldControl.setContainerClick(this.onContainerClick);
      /** Register this guy as an extension */
      this.props.__formFieldControl.setExtension('tagList', this);
      this.setState({ setFormFieldProperties: true });
    }

    // Check to see if we have a destroyed chip and need to refocus
    const prevChildren = this.getTagChildren(prevProps);
    const thisChildren = this.getTagChildren();
    if (prevChildren.length !== thisChildren.length) {
      if (prevChildren.length > thisChildren.length) {
        // if we decreased the number of children we have to
        // update the last deleted index
        updateLastDeletedIndex.call(this, prevProps, this.props);
        // fix the tab index
        updateTabIndex.call(this, this.props);
      }
    }

    if (thisChildren.length ===  0 && _.get(this.getInput(), 'props.value') === '') {
      this.props.__formFieldControl.transitionUi('CLEAR');
    } else {
      this.props.__formFieldControl.transitionUi('FILL');
    }
  }
  
  /**
   * Refs
   */
  getTagListRoot = (tagList) => {
    this.EL = tagList;
  };
  
  /**
   * Derived data
   */
  /** Get the selection model without having to use .current */
  getSelectionModel = () => this.selectionModel.current || {};

  /** Get the key manager without having to use .current */
  getKeyManager = () => this.keyManager.current || {};

  /** Get the input extension attached to this tag list */
  getInput = () => (
    this.state.inputExtension ?
      this.state.inputExtension.getInput() :
      null
  );

  /** ID for the tag list element */
  getId = (props = this.props) => props.id || this.DEFAULT_ID;
  
  isEmpty = () => (
    /**
     * Empty if there's no input, if the input is empty, AND if there
     * are no tag children
     */
    (!this.getInput() || this.getInput().isEmpty())
    && this.getChildrenCount() === 0
  );
  
  /** aria role */
  getRole = () => {
    if (this.isEmpty()) return null;
    return 'listbox';
  };
  
  /** aria described by */
  getAriaDescribedBy = () => this.state.describedByIds.join(' ');
  
  getFinalTabIndex = () => {
    /*
    we must use state first because that controls tabbing capability
    when tabbing outside of the list
     */
    if (!_.isNil(this.state.tabIndex)) return this.state.tabIndex;
    /*
    Otherwise we just use the props.tabIndex value or 0
     */
    if (!_.isNil(this.props.tabIndex)) return this.props.tabIndex;
    return 0;
  };
  
  // get the children count
  getChildrenCount = (props = this.props) => count(props.children);
  
  // get children
  getChildren = (props = this.props) => toArray(props.children);
  
  // get the children that are tags
  getTagChildren = (props = this.props) => this.getChildren(props)
    .filter(byInternalType('Tag'));
  
  // Get whether the state is focused
  getFocused = () => this.state.focused;
  
  /** Check to see if associated input target is empty */
  isInputEmpty = (element) => {
    if (element && element.nodeName.toLowerCase() === 'input') {
      return !element.value;
    }
  
    return false;
  };
  
  /**
   * Actions, listeners
   */
  /** Change the describedByIds */
  changeDescribedByIds = ({ added = [], removed = [] }) => {
    this.setState((state) => {
      let ids = [...state.describedByIds];
      const arrayRemoved = _.castArray(removed);
      const arrayAdded = _.castArray(added);
      if (arrayRemoved.length > 0) {
        ids = _.without(ids, ...arrayRemoved);
      }
      
      if (arrayAdded.length > 0) {
        ids = _.concat(ids, arrayAdded);
      }
      
      return { describedByIds: ids };
    });
  };
  
  /** Set state.tagInput for this guy */
  setTagInputState = (options) => {
    this.setState((state) => ({
      __tagInput: {
        ...state.__tagInput,
        ...options,
      },
    }));
  };
  /**
   * Focuses the the first non-disabled tag in this tag list, or the associated input when there
   * are no eligible tags.
   */
  focus = (event) => {
    if (this.props.disabled) return;
    event.persist();
    // must defer this because we have to register tagInput.focused when it focuses
    _.defer(() => {
      // TODO: ARIA says this should focus the first `selected` tag if any are selected.
      // Focus on first element if there's no tagInput inside tag-list
      if (this.state.__tagInput.id && this.state.__tagInput.getFocused()) {
        // do nothing
      } else if (this.getTagChildren().length > 0) {
        const target = event.target;
        const children = _.filter(this.EL.children, child => (
          _.get(child, 'dataset.suiType') === 'tag'
        ));
        const index = _.findIndex(children, target);
        if (index > -1) {
          this.getKeyManager().setActiveItem(index);
        } else {
          this.getKeyManager().setFirstItemActive();
        }
      } else {
        focusInput.call(this);
      }
    });
  };
  
  /** Pass events to the keyboard manager. */
  keyDown = (event) => {
    const target = event.target;
    const key = event.key;
    const manager = this.getKeyManager();
    // If they are on an empty input and hit backspace, focus the last tag
    if (key === BACKSPACE && this.isInputEmpty(target)) {
      manager.setLastItemActive();
      event.preventDefault(); // no navigation
    } else if (target && _.get(target, 'dataset.suiType') === 'tag') {
      if (key === HOME) {
        manager.setFirstItemActive();
        event.preventDefault(); // no navigation
      } else if (key === END) {
        manager.setLastItemActive();
        event.preventDefault(); // no navigation
      } else {
        manager.onKeyDown(event);
      }
    }
  };
  
  /** When blurred, mark the field as touched when focus moved outside the tag list. */
  blur = (event) => {
    window.setTimeout(() => {
      /*
      check to see if the next actively focused item is inside the tag list
      Must be deferred because we want to wait for the document to change
      focus
       */
      if (!this.EL.contains(document.activeElement)) {
        this.getKeyManager().setActiveItem(-1);
      }
    }, 0);
    
    if (!this.props.disabled) {
      if (this.state.__tagInput) {
        // If there's a tag input, we should check whether the focus moved to tag input.
        // If the focus is not moved to tag input, mark the field as touched. If the focus moved
        // to tag input, do nothing.
        // Timeout is needed to wait for the focus() event trigger on tag input.
        window.setTimeout(() => {
          if (!this.state.focused && _.isFunction(this.props.onTouched)) {
            this.props.onTouched();
          }
        }, 0);
      } else {
        // If there's no tag input, then mark the field as touched.
        if (_.isFunction(this.props.onTouched)) {
          this.props.onTouched();
        }
      }
    }
  };
  
  /** Perform when the formField does a container click */
  onContainerClick = (event) => {
    if (!originatesFromTag.call(this, event)) {
      this.focus(event);
    }
  };
  
  render() {
    const {
      id,
      tabIndex,
      required,
      disabled,
      value,
      selectable,
      children,
      ...restProps
    } = this.props;
    return (
      <React.Fragment>
        <ListKeyManager
          onTabOut={this.handleTabOut}
          items={this.getTagChildren()}
          wrap
          vertical
          horizontal="ltr"
          ref={this.keyManager}
        />
        <SelectionModel
          multiple={this.props.multiple}
          ref={this.selectionModel}
        />
        <TagListRoot
          {...restProps}
          id={this.getId()}
          tabIndex={this.getFinalTabIndex()}
          role={this.getRole()}
          value={value}
          aria-describedby={this.getAriaDescribedBy()}
          aria-required={required}
          aria-disabled={disabled}
          aria-invalid={false}
          aria-multiselectable={this.props.multiple}
          onFocus={this.focus}
          onBlur={this.blur}
          onKeyDown={this.keyDown}
          innerRef={this.getTagListRoot}
        >
          <TagListProvider value={{
            disabled,
            selectable,
            changeDescribedByIds: this.changeDescribedByIds
          }}>
            <TagInputProvider value={this.state.__tagInputProvider}>
              { children }
            </TagInputProvider>
          </TagListProvider>
        </TagListRoot>
      </React.Fragment>
    )
  }
}

const TagListPropTypes = {
  /** Uid of the tag list */
  id: PropTypes.string,
  /** Tab index for the tag list. */
  tabIndex: PropTypes.number,
  /** Whether tag list is required */
  required: PropTypes.bool,
  /**
   * Whether or not this chip list is selectable. When a chip list is not selectable,
   * the selected states for all the chips inside the chip list are always ignored.
   */
  selectable: PropTypes.bool,
  /** Orientation of the tag list. */
  'aria-orientation': PropTypes.oneOf(['horizontal', 'vertical']),
};

const TagListDefaultProps = {
  id: null,
  tabIndex: null,
  required: false,
  selectable: true,
  'aria-orientation': 'horizontal',
};

TagList.propTypes = {
  ...TagListPropTypes,
  __formFieldControl: FormFieldPropTypes,
};

TagList.defaultProps = {
  ...TagListDefaultProps,
  __formFieldControl: FormFieldDefaultProps,
};

const StackedTagList = stack(
  withFormFieldConsumer,
)(TagList);

StackedTagList.propTypes = TagListPropTypes;
StackedTagList.defaultProps = TagListDefaultProps;
StackedTagList.displayName = 'TagList';

export default StackedTagList;

/**
 * Private methods
 */
/** Attempt to focus an input if we have one. */
function focusInput() {
  if (this.state.__tagInput.focus) {
    this.state.__tagInput.focus();
  }
}

/*
Tab out function:
Prevents the chip list from capturing focus and redirecting
it back to the first chip when the user tabs out.
 */
function handleTabOut() {
  this.setState({ tabIndex: -1 }, () => {
    this.setState({ tabIndex: null });
  });
}

/** Checks whether an event comes from inside a chip element. */
function originatesFromTag(event) {
  let currentElement = event.target;
  
  while (currentElement && currentElement !== this.EL) {
    if (_.get(currentElement, 'dataset.suiType') === 'tag') return true;
    
    currentElement = currentElement.parentElement;
  }
  
  return false;
}

/**
 * If the number of tags changed, we need to update the
 * key manager state and focus the next closest chip.
 */
function updateFocusForRemovedTags() {
  const tags = this.getTagChildren(this.props);
  if (this.state.lastDestroyedTagIndex !== null && tags.length) {
    const newTagIndex = Math.min(this.state.lastDestroyedTagIndex, tags.length - 1);
    /*
    We must do this workaround to ensure that the updates are
    live. i.e., the children will change, but the tag index
    may not necessarily change. Setting it to -1 and then
    newTagIndex will ensure that the key manager will update
     */
    this.getKeyManager().setActiveItem(-1);
    _.defer(() => {
      this.getKeyManager().setActiveItem(newTagIndex);
    })
  }
  this.setState({ lastDestroyedTagIndex: null });
}

/**
 * Check the tab index as you should not be allowed to focus an empty list.
 */
function updateTabIndex(props = this.props) {
  // If we have 0 chips, we should not allow keyboard focus
  this.setState({
    tabIndex: this.getChildrenCount(props) === 0 ? -1 : null
  });
}

function updateLastDeletedIndex(prevProps, props = this.props) {
  // In case the chip that will be removed is currently focused, we temporarily store
  // the index in order to be able to determine an appropriate sibling chip that will
  // receive focus.
  const prevValues = this.getChildren(prevProps)
    .filter(byInternalType('Tag'))
    .map(toValue);
  const thisValues = this.getChildren(props)
    .filter(byInternalType('Tag'))
    .map(toValue);
  // get the missing value
  const [deletedValue] = _.difference(prevValues, thisValues);
  this.setState({
    lastDestroyedTagIndex: _.indexOf(prevValues, deletedValue),
  }, () => {
    // and update focus for any removed tags
    updateFocusForRemovedTags.call(this);
  });
}
