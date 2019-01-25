import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { ExpansionPanelHeaderContent, ExpansionPanelHeaderRoot } from './styles/index';
import { withBaseAccordionItemConsumer } from '../../cdk/accordion/context';
import { stack } from '../core/components/util';
import { ENTER, SPACE, SPACEBAR } from '../../cdk/keycodes/keys';
import { withAccordionItemConsumer } from './context';
import {
  ListKeyManagerDefaultProps, ListKeyManagerPropTypes,
  withListKeyConsumer,
} from '../../cdk/a11y';

const toArray = React.Children.toArray;

const EXCLUDED_CHILDREN = ['PanelHeaderTitle', 'PanelHeaderDescription'];

export class ExpansionPanelHeader extends React.Component {
  /***
   * Refs
   */
  getPanelHeaderRef = (panelHeader) => {
    this.PANEL_HEADER = panelHeader;
  };
  
  /***
   * Lifecycle
   */
  componentDidUpdate(prevProps) {
    /*
    If the activeItem's ID is the same as the derived labelId we have,
    then we must update focus
     */
    if (prevProps.__keyManager.activeItemIndex !== this.props.__keyManager.activeItemIndex) {
      // check if the new activeItem is this current component
      const activeItem = _.get(this.props.__keyManager, 'activeItem');
      if (activeItem.contains(this.PANEL_HEADER)) {
        this.focus();
      }
    }
  }
  
  /***
   * Derived data
   */
  getChildren = () => toArray(this.props.children);
  
  /** Get accordion item from context */
  getAccordionItem = () => _.get(this.props, '__accordionItem');
  
  /***
   * Actions
   */
  /*
  Handle keyboard event calling to toggle() if appropriate.
  
  The (SUI, not CDK) Accordion will handle other W3-recommended keyboard
  navigation, like arrow up, home, end, etc., so the keyboard event
  should NOT call stopPropagation().
   */
  onKeyDown = (event) => {
    switch (event.key) {
      case SPACE:
      case SPACEBAR:
      case ENTER:
        event.preventDefault();
        this.getAccordionItem().toggle();
        break;
      default: return;
    }
  };
  
  /** imperative focus method */
  focus = () => {
    if (!this.getAccordionItem().disabled) {
      if (this.PANEL_HEADER) {
        this.PANEL_HEADER.focus();
      }
    }
  };
  
  /***
   * Renderers
   */
  renderTitle = () => this.getChildren().filter(child => (
    _.get(child.props, '__sui-internal-type') === 'PanelHeaderTitle'
  ));
  
  renderDescription = () => this.getChildren().filter(child => (
    _.get(child.props, '__sui-internal-type') === 'PanelHeaderDescription'
  ));
  
  renderRestChildren = () => this.getChildren().filter(child => {
    const type = _.get(child.props, '__sui-internal-type');
    return EXCLUDED_CHILDREN.indexOf(type) === -1;
  });
  
  render() {
    const accordion = this.props.__accordionItem;
    return (
      <ExpansionPanelHeaderRoot
        id={this.props.__suiAccordionItem.labelId}
        role="button"
        innerRef={this.getPanelHeaderRef}
        tabIndex={accordion.disabled ? -1 : 0}
        aria-controls={accordion.id}
        aria-expanded={accordion.expanded.toString()}
        aria-disabled={accordion.disabled}
        onClick={accordion.toggle}
        onKeyDown={this.onKeyDown}
      >
        <ExpansionPanelHeaderContent>
          { this.renderTitle() }
          { this.renderDescription() }
          { this.renderRestChildren() }
        </ExpansionPanelHeaderContent>
      </ExpansionPanelHeaderRoot>
    )
  }
}

ExpansionPanelHeader.propTypes = {
  /** SUI Accordion item */
  __suiAccordionItem: PropTypes.shape({
    labelId: PropTypes.string,
  }),
  /** Accordion item builder */
  __accordionItem: PropTypes.shape({
    id: PropTypes.string,
    expanded: PropTypes.bool,
    disabled: PropTypes.bool,
    open: PropTypes.func,
    toggle: PropTypes.func,
    close: PropTypes.func,
  }),
  /** Key manager */
  __keyManager: ListKeyManagerPropTypes,
};

ExpansionPanelHeader.defaultProps = {
  __suiAccordionItem: {
    labelId: null,
  },
  __accordionItem: {
    id: null,
    expanded: false,
    disabled: false,
    open: _.noop,
    toggle: _.noop,
    close: _.noop,
  },
  __keyManager: ListKeyManagerDefaultProps,
};

const PanelHeader = stack(
  withBaseAccordionItemConsumer,
  withAccordionItemConsumer,
  withListKeyConsumer,
)(ExpansionPanelHeader);

export default PanelHeader;

PanelHeader.defaultProps = {
  '__sui-internal-type': 'PanelHeader',
};
