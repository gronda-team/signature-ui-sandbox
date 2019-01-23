import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { ListKeyManager, withListKeyConsumer } from '../../exports';
import {ARROW_DOWN, ARROW_RIGHT, ARROW_UP, TAB} from '../../../keycodes/keys';

const toArray = React.Children.toArray;

describe('ListKeyManager smoke test', () => {
  it('should render without problems', () => {
    const div = document.createElement('div');
    ReactDOM.render((
      <ListKeyManager>
        <PlainListWithManager />
      </ListKeyManager>
    ), div);
  });
});

describe('ListKeyManager', () => {
  let wrapper;
  let keyManager;
  let plainList;
  let keyManagerInstance;
  let setActiveItemSpy;
  let keyboardEvents;

  beforeAll(() => {
    wrapper = mount(
      <ListKeyManager>
        <PlainListWithManager />
      </ListKeyManager>
    );
  });

  beforeEach(() => {
    keyboardEvents = {
      TAB: new KeyboardEvent('keydown', { key: TAB }),
      DOWN: new KeyboardEvent('keydown', { key: ARROW_DOWN }),
      UP: new KeyboardEvent('keydown', { key: ARROW_UP }),
      RIGHT: new KeyboardEvent('keydown', { key: ARROW_RIGHT }),
    };

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

  it('should start off the activeItem as null', () => {
    const w = mount(
      <ListKeyManager>
        <PlainListWithManager />
      </ListKeyManager>
    );

    expect(w.state('provide').activeItem).toBe(null);
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

    // Same label
    expect(state.getLabel(keyManagerInstance.state.provide.activeItem))
      .toBe('Thorium');
    // But different index
    expect(keyManagerInstance.state.provide.activeItemIndex).toBe(1);
  });

  it('should set the activeItem to null if an invalid index is passed in', () => {
    keyManagerInstance.setActiveItem(10);
    expect(keyManagerInstance.state.provide.activeItem).toBe(null);
  });

  describe('Key events', () => {
    it('should call tabOutFn when the tab key is pressed', () => {
      const spy = jest.spyOn(keyManagerInstance.state, 'tabOutFn');
      keyManagerInstance.onKeyDown(keyboardEvents.TAB);

      expect(spy).toHaveBeenCalled();
    });

    it('should call tabOutFn when the tab key is pressed + modifier', () => {
      const spy = jest.spyOn(keyManagerInstance.state, 'tabOutFn');

      Object.defineProperty(keyboardEvents.TAB, 'shiftKey', { get: () => true });

      keyManagerInstance.onKeyDown(keyboardEvents.TAB);

      expect(spy).toHaveBeenCalled();
    });

    it('should emit an event when the active item changes', () => {
      const spy = jest.spyOn(keyManagerInstance.state, 'onChange');
      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);

      expect(spy).toHaveBeenCalledTimes(1);

      keyManagerInstance.onKeyDown(keyboardEvents.UP);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should activate the first item when pressing down on a clean key manager', () => {
      const w = mount(
        <ListKeyManager>
          <PlainListWithManager />
        </ListKeyManager>
      );

      expect(w.state('provide').activeItemIndex)
        .toBe(-1, 'Expected active index to default to -1');

      w.instance().onKeyDown(keyboardEvents.DOWN);

      expect(w.state('provide').activeItemIndex)
        .toBe(0, 'Expected first item to become active after pressing key down');
    });

    it('should not prevent the default keyboard action when pressing tab', () => {
      expect(keyboardEvents.TAB.defaultPrevented).toBe(false);

      keyManager.instance().onKeyDown(keyboardEvents.TAB);

      expect(keyboardEvents.TAB.defaultPrevented).toBe(false);
    });

    it('should not do anything for unsupported key presses', () => {
      const unsupported = new KeyboardEvent('keydown', {
        key: '/',
      });
      keyManagerInstance.setActiveItem(1);

      expect(keyManagerInstance.state.provide.activeItemIndex).toBe(1);
      expect(unsupported.defaultPrevented).toBe(false);

      keyManagerInstance.onKeyDown(unsupported);

      expect(keyManagerInstance.state.provide.activeItemIndex).toBe(1);
      expect(unsupported.defaultPrevented).toBe(false);
    });

    it('should ignore the horizontal keys when only in vertical mode', () => {
      keyManager.setState({ horizontal: null, vertical: true });

      expect(keyManagerInstance.state.provide.activeItemIndex).toBe(0);

      keyManagerInstance.onKeyDown(keyboardEvents.RIGHT);

      expect(keyManagerInstance.state.provide.activeItemIndex).toBe(0);
      expect(keyboardEvents.RIGHT.defaultPrevented).toBe(false);
    });

    it('should ignore the horizontal keys when only in horizontal mode', () => {
      keyManager.setState({ horizontal: 'ltr', vertical: false });

      expect(keyManagerInstance.state.provide.activeItemIndex).toBe(0);

      keyManagerInstance.onKeyDown(keyboardEvents.DOWN);

      expect(keyManagerInstance.state.provide.activeItemIndex).toBe(0);
      expect(keyboardEvents.DOWN.defaultPrevented).toBe(false);
    });
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

const PlainListWithManager = withListKeyConsumer(PlainList);
