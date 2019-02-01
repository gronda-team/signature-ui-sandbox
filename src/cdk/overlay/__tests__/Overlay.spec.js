import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cheerio from 'cheerio';
import { mount } from 'enzyme';
import { Overlay } from '../exports';
import OverlayContainer from '../OverlayContainer';

describe('Overlay', () => {
  let wrapper;
  let root;
  let overlay;
  let overlayInstance;
  let overlayContainer;
  let overlayContainerElement; // HTML element
  beforeAll(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
    wrapper = mount((
      <OverlayContainer>
        <Overlay>
          <TestMessage />
        </Overlay>
      </OverlayContainer>
    ), {
      attachTo: root,
    });
  });

  beforeEach(() => {
    wrapper.mount();
    overlay = wrapper.find('Overlay');
    overlayInstance = overlay.instance();
    overlayContainer = wrapper.find(OverlayContainer);
    overlayContainerElement = overlayInstance.props.__overlayContainer.getContainer();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should load the TestMessage into the overlay', () => {
    overlayInstance.create();
    overlayInstance.attach();

    expect(wrapper.text()).toContain('Hello');

    overlayInstance.dispose();
    expect(wrapper.text()).toBe('');
  });

  it('should disable pointer events of the pane element when detached', () => {
    overlayInstance.create();
    overlayInstance.attach();
    const paneElement = overlayInstance.state.pane;

    expect(paneElement.childNodes.length).not.toBe(0);
    // Should enable pointer events when it's attached
    expect(paneElement.style.pointerEvents).toBe('auto');

    overlayInstance.detach();

    expect(paneElement.childNodes.length).toBe(0);
    // Should disable pointer events when detaching
    expect(paneElement.style.pointerEvents).toBe('none');
  });

  it('should open multiple overlays', () => {
    const w = mount((
        <OverlayContainer>
          <React.Fragment>
            <Overlay>
              <TestMessage />
            </Overlay>
            <Overlay>
              <LatinMessage />
            </Overlay>
          </React.Fragment>
        </OverlayContainer>
      ), {
        attachTo: root,
      },
    );

    const overlays = w.find('Overlay');
    const overlayContainer = w.find(OverlayContainer);

    overlays.forEach((overlayWrapper) => {
      const overlay = overlayWrapper.instance();
      overlay.create();
      overlay.attach();
    });

    expect(overlayContainer.find('Overlay').length).toBe(2);
    overlayContainer.children().forEach((overlay) => {
      expect(overlay.text()).toBeTruthy();
    });
  })
});

/** Simple component for testing portal */
const TestMessage = () => <p>Hello world</p>;
const LatinMessage = () => <p>Lorem ipsum</p>;
