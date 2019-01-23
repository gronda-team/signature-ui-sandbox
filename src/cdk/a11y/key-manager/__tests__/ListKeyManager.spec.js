import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { ListKeyManager, withListKeyProvider, withListKeyConsumer } from '../../exports';

const toArray = React.Children.toArray;

describe('ListKeyManager smoke test', () => {
  it('should render without problems', () => {
    const div = document.createElement('div');
    ReactDOM.render((
      <PlainListWithManager />
    ), div);
  });
});

describe('ListKeyManager', () => {
  let wrapper;
  let keyManager;
  let plainList;
  let keyManagerInstance;
  let setActiveItemSpy;

  beforeAll(() => {
    wrapper = mount(<PlainListWithManager />);
  });

  beforeEach(() => {
    wrapper.mount();

    keyManager = wrapper.find('ListKeyManager');
    plainList = wrapper.find('PlainList');

    keyManagerInstance = keyManager.instance();

    // First item is already focused
    keyManagerInstance.setFirstItemActive();

    setActiveItemSpy = jest.spyOn(keyManagerInstance, 'setActiveItem');
  });

  afterEach(() => {
    wrapper.unmount();
    jest.resetAllMocks();
  });

  it('should maintain the active item if the number of items changes', () => {
    const state = keyManagerInstance.state;
    expect(state.provide.activeItemIndex).toBe(0);
    expect(state.getLabel(state.provide.activeItem))
      .toBe('Thorium');

    plainList.instance().setState(state => ({
      ITEMS: ['Actinium', ...state.ITEMS],
      disabled: [false, ...state.disabled],
    }));

    expect(state.provide.activeItemIndex).toBe(1);
    expect(state.getLabel(state.provide.activeItem))
      .toBe('Thorium');
  });
});

/**
 * Rather than test a library component, this testable component
 * represents how most other library components interact with
 * the ListKeyManager, without any additional overhead.
 */
/** Fake list key item */
function ListKeyItem(props) {
  return (
    <li>{ props.label }</li>
  )
}

ListKeyItem.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string,
};

ListKeyItem.defaultProps = {
  disabled: false,
  label: '',
  __key: 'ListKeyItem',
};

class List extends React.Component {
  render() {
    return <ul>{ this.props.children }</ul>
  }
}

const LIST_ITEMS = [
  'Actinium',
  'Thorium',
  'Protactinium',
  'Uranium',
  'Neptunium',
  'Plutonium',
  'Americium',
  'Curium',
  'Berkelium',
  'Californium',
  'Einsteinium',
  'Fermium',
  'Mendelevium',
  'Nobelium',
  'Lawrencium',
  'Lanthanum',
  'Cerium',
  'Praseodymium',
  'Neodymium',
  'Promethium',
  'Samarium',
  'Europium',
  'Gadolinium',
  'Terbium',
  'Dysprosium',
  'Holmium',
  'Erbium',
  'Thulium',
  'Ytterbium',
  'Lutetium',
];

class PlainList extends React.Component {
  constructor() {
    super();

    this.state = {
      ITEMS: [...LIST_ITEMS].slice(1, 5),
      disabled: _.times(4, _.stubFalse),
    };

    this.LIST_REF = React.createRef();
  }

  componentDidMount() {
    this.props.__keyManager.setConfig({
      items: toArray(this.LIST_REF.current.props.children),
      getLabel: item => _.get(item.props, 'label', ''),
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.ITEMS.length !== prevState.ITEMS.length) {
      this.props.__keyManager.setConfig({
        items: toArray(this.LIST_REF.current.props.children),
      });
    }
  }

  render() {
    return (
      <List ref={this.LIST_REF}>
        { this.state.ITEMS.map((item, index) => (
          <ListKeyItem key={item} label={item} disabled={this.state.disabled[index]} />
        )) }
      </List>
    );
  }
}

const PlainListWithManager = withListKeyProvider(withListKeyConsumer(PlainList));
