import * as React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import { ScrollDispatcher, ViewportRuler } from '../../Scrolling';
import { Platform } from '../../Platform';
import { OverlayActionContext, OverlayActions, OverlayStateContext } from '../context';
import Overlay from '../Overlay';
import { useRepositionScrollStrategy } from './index';
import OverlayContainer from '../OverlayContainer';
import { useGlobalPositionStrategy } from '../exports';

function FakeProvider({ children }) {
  return (
    <Platform>
      <OverlayContainer>
        <ViewportRuler>
          <ScrollDispatcher>
            { children }
          </ScrollDispatcher>
        </ViewportRuler>
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

describe('Reposition scroll strategy', function () {
  afterEach(function () {
    cleanup();
    jest.clearAllMocks();
  });

  it('should update the overlay position when the page is scrolled', function () {
    renderWithWrapper(
      <Overlay
        useScrollStrategy={useRepositionScrollStrategy}
        usePositionStrategy={useGlobalPositionStrategy}
      ><TestComponent /></Overlay>
    );

    act(attach);

    const applySpy = jest.spyOn(window.__overlay__.state.position, 'apply');

    fireEvent.scroll(document);
    expect(applySpy).toHaveBeenCalledTimes(1);

    fireEvent.scroll(document);
    expect(applySpy).toHaveBeenCalledTimes(2);
  });

  it('should not update the position once the overlay is detached', function () {
    renderWithWrapper(
      <Overlay
        useScrollStrategy={useRepositionScrollStrategy}
        usePositionStrategy={useGlobalPositionStrategy}
      ><TestComponent /></Overlay>
    );

    act(attach);

    const applySpy = jest.spyOn(window.__overlay__.state.position, 'apply');

    act(detach);

    fireEvent.scroll(document);

    expect(applySpy).not.toHaveBeenCalled();
  });

  it('should be able to close the overlay once it is out of view', function () {
    renderWithWrapper(
      <Overlay
        useScrollStrategy={useRepositionScrollStrategy}
        scrollStrategyConfig={{ autoClose: true }}
        usePositionStrategy={useGlobalPositionStrategy}
      ><TestComponent /></Overlay>
    );

    act(attach);

    expect(document.body).toHaveTextContent('Hello, world');

    jest.spyOn(window.__overlay__.state.pane, 'getBoundingClientRect')
      .mockReturnValue({
        top: -1000,
        bottom: -900,
        left: 0,
        right: 100,
        width: 100,
        height: 100
      });

    fireEvent.scroll(document);

    expect(document.body).not.toHaveTextContent('Hello, world');
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
