import * as React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import { ScrollDispatcher, ViewportRulerContext } from '../../Scrolling';
import { Platform } from '../../Platform';
import { OverlayActionContext, OverlayActions, OverlayStateContext } from '../context';
import Overlay from '../Overlay';
import { useCloseScrollStrategy } from './index';
import OverlayContainer from '../OverlayContainer';
import { useGlobalPositionStrategy } from '../exports';

let scrollPosition = 0;

function FakeProvider({ children }) {
  const fakeViewportRulerProvider = React.useMemo(() => ({
    getViewportScrollPosition: () => ({ top: scrollPosition })
  }), [scrollPosition]);

  return (
    <Platform>
      <OverlayContainer>
        <ViewportRulerContext.Provider value={fakeViewportRulerProvider}>
          <ScrollDispatcher>
            { children }
          </ScrollDispatcher>
        </ViewportRulerContext.Provider>
      </OverlayContainer>
    </Platform>
  );
}

function renderWithWrapper(app) {
  return render(app, { wrapper: FakeProvider });
}

const attach = () => {
  window.__overlay__.dispatch({
    type: OverlayActions.SET_ATTACHED_STATE,
    data: true,
  });
};

const detach = () => {
  window.__overlay__.dispatch({
    type: OverlayActions.SET_ATTACHED_STATE,
    data: false,
  });
};

describe('Close scroll strategy', function () {
  beforeEach(function () {
    scrollPosition = 0;
  });

  afterEach(function () {
    cleanup();
    jest.clearAllMocks();
  });

  it('should detach the overlay as soon as the user scrolls', function () {
    renderWithWrapper(
      <Overlay useScrollStrategy={useCloseScrollStrategy}><TestComponent /></Overlay>
    );

    act(attach);
    expect(document.body).toHaveTextContent('Hello, world');

    fireEvent.scroll(document);
    expect(document.body).not.toHaveTextContent('Hello, world');
  });

  it('should be able to reposition the overlay up to a certain threshold before closing', function () {
    renderWithWrapper(
      <Overlay
        useScrollStrategy={useCloseScrollStrategy}
        scrollStrategyConfig={{ threshold: 50 }}
        usePositionStrategy={useGlobalPositionStrategy}
      ><TestComponent /></Overlay>
    );

    const applySpy = jest.spyOn(window.__overlay__.state.position, 'apply');

    act(attach);

    for (let i = 0; i < 50; i++) {
      scrollPosition++;
      fireEvent.scroll(document);
    }

    expect(applySpy).toHaveBeenCalledTimes(50);
    expect(document.body).toHaveTextContent('Hello, world');

    scrollPosition++;
    fireEvent.scroll(document);

    expect(document.body).not.toHaveTextContent('Hello, world');
  });

  it('should not close if the user starts scrolling away and comes back', function () {
    scrollPosition = 100;

    renderWithWrapper(
      <Overlay
        useScrollStrategy={useCloseScrollStrategy}
        scrollStrategyConfig={{ threshold: 50 }}
        usePositionStrategy={useGlobalPositionStrategy}
      ><TestComponent /></Overlay>
    );

    const applySpy = jest.spyOn(window.__overlay__.state.position, 'apply');

    act(attach);

    // Scroll down 30px
    for (let i = 0; i < 30; i++) {
      scrollPosition++;
      fireEvent.scroll(document);
    }

    // Scroll up 30px
    for (let i = 0; i < 30; i++) {
      scrollPosition--;
      fireEvent.scroll(document);
    }

    expect(applySpy).toHaveBeenCalledTimes(60);
    expect(document.body).toHaveTextContent('Hello, world');
  });
});

function TestComponent() {
  const dispatch = React.useContext(OverlayActionContext);
  const state = React.useContext(OverlayStateContext);

  React.useEffect(() => {
    // Attach the callbacks to the window for testing. The actual implementation would have the
    // parent components (like this one) dispatching attach/detach/etc. events depending on
    // the component's spec. They're attached to the window here to simulate that behavior without
    // having to build a library component.
    window.__overlay__ = {
      state, dispatch,
    };
  }, [state]);

  return <div>Hello, world</div>;
}
