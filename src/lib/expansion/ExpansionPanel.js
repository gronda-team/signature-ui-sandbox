import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { ExpansionPanelBody, ExpansionPanelContent, ExpansionPanelRoot } from './styles/index';
import { stack } from '../core/components/util';
import { withBaseAccordionItemConsumer } from '../../cdk/accordion/context';
import BaseAccordionItem, { PUBLIC_PROP_TYPES, PUBLIC_DEFAULT_PROPS } from '../../cdk/accordion/AccordionItem';
import { AccordionItemProvider, withAccordionConsumer } from './context';
import {
  withListKeyConsumer,
  ListKeyManagerPropTypes,
  ListKeyManagerDefaultProps,
} from '../../cdk/a11y/key-manager/ListKeyManager';

const toArray = React.Children.toArray;

const EXCLUDED_CHILDREN = ['PanelHeader', 'PanelActionRow'];

/*
Provides
- labelId to ExpansionPanelHeader
Consumes
- BaseAccordion (checks if ExpansionPanel has parent Accordion)
- BaseAccordionItem (contains open/closed information)*

* The consumable export for this is something like <ExpansionPanel ... />
  Internally, that means it's this component, wrapped in a BaseAccordionItem provider
  while also consuming BaseAccordion
 */
class BaseExpansionPanel extends React.Component {
  constructor() {
    super();
    
    this.state = {
      panelHeight: 0, // panel's height in pixels... this is what we're animating
      // start, animating, done
      panelAnimationPhase: null,
    };
  }
  
  /***
   * Lifecycle methods
   */
  getSnapshotBeforeUpdate(prevProps, prevState) {
    const panelHeight = this.PANEL_CONTENT.scrollHeight;
    if (panelHeight !== prevState.panelHeight) {
      /*
      If there's a change in the scroll height, then return it
      so it can be set anew.
       */
      return panelHeight;
    }
    
    return null;
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.setPanelHeight(snapshot);
    }
  }
  
  /***
   * element refs
   */
  getPanelContentRef = (body) => {
    this.PANEL_CONTENT = body;
  };
  
  /***
   * Actions
   */
  setPanelHeight = (height) => {
    this.setState({ panelHeight: height });
  };
  
  setPanelAnimationPhase = phase => () => {
    this.setState({ panelAnimationPhase: phase });
  };
  
  /***
   * Derived data
   */
  // Convenience method for getting children
  getChildren = () => toArray(this.props.children);
  
  // Get ID
  getId = () => this.props.id ||  _.get(this.getAccordionItem(), 'id');
  
  // Getting the header id
  getHeaderId = () => `${this.getId()}--label`;
  
  // Get the CDK accordion
  getAccordionItem = () => _.get(this.props, '__accordionItem');
  
  // Get the CDK accordion
  getAccordionParent = () => this.hasParentAccordion() ?
    _.get(this.props, '__suiAccordion') : null;
  
  // Get whether or not the accordion item is expanded
  isExpanded = () => _.get(this.getAccordionItem(), 'expanded');
  
  /** Gets the expanded state string. */
  getExpandedState = () => this.isExpanded() ? 'expanded' : 'collapsed';
    
    // Whether there's a parent accordion
  hasParentAccordion = () => !_.isNil(this.props.__suiAccordion);
  
  /** Whether the expansion indicator should be hidden. */
  getHideToggle = () => {
    if (this.hasParentAccordion()) {
      return this.getAccordionParent().hideToggle;
    }
    
    return this.props.hideToggle;
  };
  
  /** Determines whether the expansion panel should have spacing between it and its siblings. */
  hasSpacing = () => {
    if (this.hasParentAccordion()) {
      const mode = this.isExpanded() ? this.getAccordionParent().displayMode : this.getExpandedState();
      return mode === 'default';
    }
    
    return false;
  };
    
    // Provider value
  providerValue = () => ({
    labelId: this.getHeaderId(),
  });
  
  /***
   * Renderers
   */
  renderPanelHeaderChild = () => this.getChildren().filter(child => (
    _.get(child.props, '__sui-internal-type') === 'PanelHeader'
  ));
  
  renderPanelActionRowChild = () => this.getChildren().filter(child => (
    _.get(child.props, '__sui-internal-type') === 'PanelActionRow'
  ));
  
  renderRestChildren = () => this.getChildren().filter(child => {
    const type = _.get(child.props, '__sui-internal-type');
    return EXCLUDED_CHILDREN.indexOf(type) === -1;
  });
  
  render() {
    const {
      onClose,
      onOpen,
      onExpansion,
      __accordionItem,
      __suiAccordion,
      __keyManager,
      ...restProps,
    } = this.props;
    
    return (
      /*
      data-expanded: Boolean (whether the panel is expanded or not)
      data-expansion: Boolean (whether the panel should have the expansion margins)
       */
      <AccordionItemProvider value={this.providerValue()}>
        <ExpansionPanelRoot
          {...restProps}
          data-disabled={__accordionItem.disabled}
          data-expanded={__accordionItem.expanded}
          data-expansion={this.hasSpacing()}
        >
          { this.renderPanelHeaderChild() }
          <ExpansionPanelContent
            role="region"
            aria-labelledby={this.getHeaderId()}
            id={__accordionItem.id}
            innerRef={this.getPanelContentRef}
            data-expansion-state={this.getExpandedState()}
            data-animation-state={this.state.panelAnimationPhase}
            height={this.state.panelHeight}
            onTransitionStart={this.setPanelAnimationPhase('start')}
            onTransitionEnd={this.setPanelAnimationPhase('done')}
          >
            <ExpansionPanelBody>
              { this.renderRestChildren() }
            </ExpansionPanelBody>
            { this.renderPanelActionRowChild() }
          </ExpansionPanelContent>
        </ExpansionPanelRoot>
      </AccordionItemProvider>
    )
  }
}

BaseExpansionPanel.propTypes = {
  /** Whether the toggle indicator should be hidden. */
  hideToggle: PropTypes.bool,
  /** Accordion item builder */
  __accordionItem: PropTypes.shape({
    id: PropTypes.string,
    expanded: PropTypes.bool,
    disabled: PropTypes.bool,
    open: PropTypes.func,
    toggle: PropTypes.func,
    close: PropTypes.func,
  }),
  /** Accordion component */
  __suiAccordion: PropTypes.shape({
    displayMode: PropTypes.oneOf(['flat', 'default']),
    hideToggle: PropTypes.bool,
  }),
  /** list key manager */
  __keyManager: ListKeyManagerPropTypes,
};

BaseExpansionPanel.defaultProps = {
  hideToggle: false,
  __accordionItem: {
    id: null,
    expanded: false,
    disabled: false,
    open: _.noop,
    toggle: _.noop,
    close: _.noop,
  },
  /*
  This must be default null because accordion is "optional"
   */
  __suiAccordion: null,
  __keyManager: ListKeyManagerDefaultProps,
};

/*
Includes the consumers for all the context values.
 */
const ExpansionPanel = stack(
  withAccordionConsumer,
  withBaseAccordionItemConsumer,
  withListKeyConsumer,
)(BaseExpansionPanel);

/*
We still have to wrap the ExpansionPanel in a <BaseAccordionItem />. Note that
we can't put it in the component itself because it would render Consumer -> Provider,
which is the opposite of what it should be.
 */
export default function ExpansionPanelWithContext(props) {
  const {
    onClose,
    onOpen,
    onExpansion,
    ...restProps,
  } = props;
  return (
    <BaseAccordionItem
      onClose={onClose}
      onOpen={onOpen}
      onExpansion={onExpansion}
      disabled={restProps.disabled}
      id={restProps.id}
    >
      <ExpansionPanel {...restProps} />
    </BaseAccordionItem>
  )
};

ExpansionPanelWithContext.propTypes = {
  ...PUBLIC_PROP_TYPES,
  hideToggle: BaseExpansionPanel.propTypes.hideToggle,
};

ExpansionPanelWithContext.defaultProps = {
  ...PUBLIC_DEFAULT_PROPS,
  '__sui-internal-type': 'Panel',
  hideToggle: BaseExpansionPanel.defaultProps.hideToggle,
};
