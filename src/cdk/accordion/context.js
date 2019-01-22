import * as React from 'react';
import _ from 'lodash';

const { Provider: BaseAccordionProvider, Consumer: BaseAccordionConsumer } = React.createContext({
  id: null,
  expanded: null,
  changeExpanded: _.noop,
});

BaseAccordionConsumer.displayName = 'BaseAccordion';

export function withBaseAccordionConsumer(Component) {
  function WithBaseAccordionConsumer(props) {
    return (
      <BaseAccordionConsumer>
        { value => <Component {...props} __accordion={value} />}
      </BaseAccordionConsumer>
    )
  }
  
  WithBaseAccordionConsumer.displayName = `WithBaseAccordionConsumer(${Component.displayName})`;
  
  return WithBaseAccordionConsumer;
}

export { BaseAccordionProvider };

const { Provider: BaseAccordionItemProvider, Consumer: BaseAccordionItemConsumer } = React.createContext({
  id: null,
  expanded: false,
  disabled: false,
  open: _.noop,
  toggle: _.noop,
  close: _.noop,
});

BaseAccordionItemConsumer.displayName = 'BaseAccordionItem';

export function withBaseAccordionItemConsumer(Component) {
  function WithBaseAccordionItemConsumer(props) {
    return (
      <BaseAccordionItemConsumer>
        { value => <Component {...props} __accordionItem={value} />}
      </BaseAccordionItemConsumer>
    )
  }
  
  WithBaseAccordionItemConsumer.displayName = `WithBaseAccordionItemConsumer(${Component.displayName})`;
  
  return WithBaseAccordionItemConsumer;
}

export { BaseAccordionItemProvider };
