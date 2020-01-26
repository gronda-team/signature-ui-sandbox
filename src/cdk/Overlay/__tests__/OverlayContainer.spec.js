import * as React from 'react';
import noop from 'lodash/noop';
import '@testing-library/jest-dom/extend-expect';
import { render, cleanup, fireEvent, act } from '@testing-library/react';
import OverlayContainer from '../OverlayContainer';
import { OverlayContainerContext, useOverlayContainer } from '../context';

describe('OverlayContainer', function () {
  let rendered;
  beforeEach(function () {
    rendered = render(
      <OverlayContainer>
        <TestComponent />
      </OverlayContainer>
    );
  });

  afterEach(function () {
    cleanup();
  });

  it('should remove the overlay container element from the DOM upon unmount', function () {
    act(() => {
      window.__overlay__.getContainer();
    });

    expect(document.querySelector('div[data-sui-overlay-root]')).not.toBeNull();

    rendered.unmount();

    expect(document.querySelector('div[data-sui-overlay-root]')).toBeNull();
  });

  it('should return the overlay container element', function () {
    let containerElement;

    act(() => {
      containerElement = window.__overlay__.getContainer();
    });

    expect(containerElement).toBeTruthy();
    expect(containerElement).toBeInTheDocument();
  });

  it('should ensure that there is only one overlay container element', function () {
    const extraContainer = document.createElement('div');
    extraContainer.dataset.suiOverlayRoot = 'true';
    document.body.appendChild(extraContainer);

    act(() => {
      window.__overlay__.getContainer();
    });

    expect(document.querySelectorAll('div[data-sui-overlay-root]')).toHaveLength(1);
  });
});

describe('Overlay keyboard dispatcher', function () {
  let rendered;
  beforeEach(function () {
    rendered = render(<TestDispatchComponent />, { wrapper: OverlayContainer });
  });

  afterEach(function () {
    rendered.unmount();
    cleanup();
  });

  it('should track the listeners in order as they are attached and detached', function () {
    act(() => {
      window.__overlay__.addKeyDownListener(1, noop);
      window.__overlay__.addKeyDownListener(2, noop);
    });

    const currentListeners = window.__overlay__.getCurrentListeners();
    expect(currentListeners.length).toBe(2);
    expect(currentListeners[0].id).toBe(1);
    expect(currentListeners[1].id).toBe(2);

    act(() => {
      window.__overlay__.removeKeyDownListener(1);
      window.__overlay__.addKeyDownListener(1, noop);
    });

    expect(currentListeners[0].id).toBe(2);
    expect(currentListeners[1].id).toBe(1);
  });

  it('should dispatch body keyboard events to the most recently attached overlay', function () {
    const firstOverlaySpy = jest.fn();
    const secondOverlaySpy = jest.fn();

    act(() => {
      window.__overlay__.addKeyDownListener(1, firstOverlaySpy);
      window.__overlay__.addKeyDownListener(2, secondOverlaySpy);
    });

    fireEvent.keyDown(document.body, { key: 'Escape' });

    // Most recent overlay should receive event
    expect(firstOverlaySpy).not.toHaveBeenCalled();
    expect(secondOverlaySpy).toHaveBeenCalled();
  });

  it('should not dispatch keyboard events when propagation is stopped', function () {
    const button = rendered.queryByTestId('test-button');

    const overlaySpy = jest.fn();

    act(() => {
      window.__overlay__.addKeyDownListener(1, overlaySpy);
    });

    // Simulate `stopPropagation`
    fireEvent.keyDown(button, { key: 'Escape', bubbles: false });

    expect(overlaySpy).not.toHaveBeenCalled();
  });

  it('should dispose of the global event keyboard event handlers correctly', function () {
    const addEventListenerSpy = jest.spyOn(document.body, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document.body, 'removeEventListener');

    act(() => {
      window.__overlay__.addKeyDownListener(1, noop);
    });

    expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

    act(() => {
      window.__overlay__.removeKeyDownListener(1);
    });

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
  });

  it('should replace listeners in place without changing the order', function () {
    const firstSpy = jest.fn();
    const secondSpy = jest.fn();
    const thirdSpy = jest.fn();

    act(() => {
      window.__overlay__.addKeyDownListener(1, firstSpy);
      window.__overlay__.addKeyDownListener(2, secondSpy);
      window.__overlay__.addKeyDownListener(2, thirdSpy);
    });

    fireEvent.keyDown(document.body, { key: 'Escape' });

    const currentListeners = window.__overlay__.getCurrentListeners();
    expect(currentListeners.length).toBe(2);
    // Order should be respected
    expect(currentListeners[0].id).toBe(1);
    expect(currentListeners[1].id).toBe(2);
    // This spy is on the bottom so it shouldn't have been called
    expect(firstSpy).not.toHaveBeenCalled();
    // This spy has been replaced, so it shouldn't be called
    expect(secondSpy).not.toHaveBeenCalled();
    // This is the most recent spy of the top most overlay, so it should be called
    expect(thirdSpy).toHaveBeenCalled();
  });
});

function TestComponent() {
  const getContainer = useOverlayContainer();

  React.useEffect(() => {
    window.__overlay__ = { getContainer };

    return () => {
      delete window.__overlay__;
    };
  }, []);

  return (
    <div>Test div</div>
  );
}

function TestDispatchComponent() {
  const {
    addKeyDownListener, removeKeyDownListener, getCurrentListeners
  } = React.useContext(OverlayContainerContext);

  React.useEffect(() => {
    window.__overlay__ = { addKeyDownListener, removeKeyDownListener, getCurrentListeners };

    return () => {
      delete window.__overlay__;
    };
  }, []);

  const handleKeyDown = React.useCallback((event) => {
    event.stopPropagation();
  }, []);

  return (
    <React.Fragment>
      <div>Testing dispatch</div>
      <button data-testid="test-button" onKeyDown={handleKeyDown}>Test button</button>
    </React.Fragment>
  );
}
