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
import {
  ExtensionDefaultProps,
  ExtensionPropTypes,
  withExtensionManager
} from '../form-field/context/ExtensionsContext';
import { RTLDefaultProps, RTLPropTypes } from '../../cdk/bidi';

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
      __tagInputProvider: { // TagInput is the provider (of getters and w/e)
        keydown: this.keyDown,
        isFocused: this.getFocused,
        blur: this.blur,
      },
      /** References to tags, keyed by their default IDs */
      tagRefs: {},
      /** Currently active item by its tag ID */
      activeItemId: null,
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
      this.props.__extensionManager.updateExtensionData('##tag-list', {
        list: this,
      });
      this.setState({ setFormFieldProperties: true });
    }

    // Check to see if we have a destroyed chip and need to refocus
    if (this.getTagChildren(prevProps).length !== this.getTagChildren().length) {
      if (this.getTagChildren(prevProps).length > this.getTagChildren().length) {
        // If we decreased the number of tags we have, then we have to
        // update the last deleted index.
        updateLastDeletedIndex.call(this, prevProps, this.props);
        // fix the tab index
        updateTabIndex.call(this, this.props);
      }
    }

    /**
     * Save this to a variable because we might call this if FormField unmounts first,
     * which might lead to a "ui is not defined" error.
     */
    const ui = this.props.__formFieldControl.ui;
    if (
      _.size(this.state.tagRefs) === 0
      && _.get(this.getInput(), 'props.value') === ''
      && !_.invoke(ui, 'matches', 'value.empty')
    ) {
      this.props.__formFieldControl.transitionUi('CLEAR');
    } else if (
      (_.size(this.state.tagRefs) > 0
      || (_.get(this.getInput(), 'props.value') !== ''))
      && !_.invoke(ui, 'matches', 'value.filled')
    ) {
      this.props.__formFieldControl.transitionUi('FILL');
    } else if (
      _.size(this.state.tagRefs) === 0
      && (_.get(this.getInput(), 'props.value') === '')
      && !(_.get(this.getInput(), 'state.focused', false))
      && _.invoke(ui, 'matches', 'field.enabled.focused')
    ) {
      this.props.__formFieldControl.transitionUi('BLUR');
    }

    /**
     * Handle the focus styling. We use activeItemId for a proxy
     * for which tag item is currently focused. If it's null, then
     * obviously we're not focusing any tag.
     *
     * We also check to see if we have a value in the input field
     * using this.isFocused().
     */
    if (prevState.activeItemId !== this.state.activeItemId) {
      if (this.isFocused()) {
        this.props.__formFieldControl.transitionUi('FOCUS');
      } else {
        this.props.__formFieldControl.transitionUi('BLUR');
      }
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

  /** Get the directionality */
  getDir = () => ['ltr', 'rtl'].indexOf(this.props.dir) > -1 ?
    this.props.dir :
    'ltr';

  /** Get the key manager without having to use .current */
  getKeyManager = () => this.keyManager.current || {};

  /** Get the input extension attached to this tag list */
  getInput = () => (
    _.get(this.props.__extensionManager, ['extendedData', 'control'])
  );

  /** ID for the tag list element */
  getId = (props = this.props) => props.id || this.DEFAULT_ID;

  isEmpty = () => (
    /**
     * Empty if there's no input, if the input is empty, AND if there
     * are no tag children
     */
    (!this.getInput() || this.getInput().isEmpty())
    && _.size(this.state.tagRefs) === 0
  );

  /** Check to see if this tag list is focused */
  isFocused = () => (
    this.getInput() && this.getInput().state.focused || !_.isNil(this.state.activeItemId)
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
  /** Register a tag item */
  register = (id, ref) => {
    this.setState(state => ({
      tagRefs: {
        ...state.tagRefs,
        [id]: ref,
      },
    }));
  };

  /** Remove a tag reference from the state */
  deregister = (id) => {
    this.setState((state) => {
      const { [id]: unused, ...restRefs } = state.tagRefs;
      return { tagRefs: restRefs };
    });
  };

  /** Handle the currently active tag item */
  handleCurrentActiveIndex = (index) => {
    const value = _.get(toArray(this.props.children), [index, 'props', 'value']);
    const currentActiveRef = _.find(this.state.tagRefs, { props: { value } });
    this.setState({
      activeItemId: currentActiveRef ?
        currentActiveRef.DEFAULT_ID :
        null,
    });
  };

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

  /**
   * Focuses the the first non-disabled tag in this tag list, or the associated input when there
   * are no eligible tags.
   */
  focus = (event) => {
    if (this.props.disabled) return;
    event.persist();
    // must defer this because we have to register tagInput.focused when it focuses
    window.requestAnimationFrame(() => {
      // TODO: ARIA says this should focus the first `selected` tag if any are selected.
      // Focus on first element if there's no tagInput inside tag-list
      if (this.state.inputExtension.state.focused) {
        // do nothing
      } else if (_.size(this.state.tagRefs) > 0) {
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
    window.requestAnimationFrame(() => {
      if (!hasFocusedTag.call(this)) {
        this.getKeyManager().setActiveItem(-1);
      }
    });

    if (!this.props.disabled) {
      if (this.getInput()) {
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
          onChange={this.handleCurrentActiveIndex}
          items={this.getTagChildren()}
          wrap
          vertical
          horizontal={this.getDir()}
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
            activeItemId: this.state.activeItemId,
            register: this.register,
            deregister: this.deregister,
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
  /** Directionality */
  dir: RTLPropTypes,
};

const TagListDefaultProps = {
  id: null,
  tabIndex: null,
  required: false,
  selectable: true,
  'aria-orientation': 'horizontal',
  dir: RTLDefaultProps,
};

TagList.propTypes = {
  ...TagListPropTypes,
  __formFieldControl: FormFieldPropTypes,
  __extensionManager: ExtensionPropTypes,
};

TagList.defaultProps = {
  ...TagListDefaultProps,
  __formFieldControl: FormFieldDefaultProps,
  __extensionManager: ExtensionDefaultProps,
};

const StackedTagList = stack(
  withExtensionManager,
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
  if (this.getInput()) {
    this.getInput().focus();
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

/** Checks whether any of the tags are focused */
function hasFocusedTag(state = this.state) {
  return _.some(state.tagRefs, ref => _.get(ref, 'state.focused', false));
}
