import styled, { css } from 'styled-components';
import { OVERLAY_CONTAINER_PROP_KEBAB } from './constants';

const zIndexOverlayContainer = 1000;
const zIndexOverlay = 1000;
const zIndexOverlayBackdrop = 1000;

const backdropDarkBackground = 'rgba(0, 0, 0, 0.32)';
const backdropDuration = '400ms';
const backdropTimingFunction = 'cubic-bezier(0.25, 0.8, 0.25, 1)';

const overlayMixin = css`
  // Disable events from being captured on the overlay container.
  pointer-events: none;

  // The container should be the size of the viewport.
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

// Mixin must be used since we're programmatically adding the element to the DOM instead of
// creating it via React.
const overlayContainerMixin = css`
  ${overlayMixin}
  
  position: fixed;
  z-index: ${zIndexOverlayContainer};
  
  &:empty {
    // Hide the element when it doesn't have any child nodes. This doesn't
    // include overlays that have been detached, rather than disposed.
    display: none;
  }
`;

export const globalOverlayStyle = css`
  [data-${OVERLAY_CONTAINER_PROP_KEBAB}], [data-overlay-position-strategy="global"] {
    ${overlayMixin}
  }
  
  [data-${OVERLAY_CONTAINER_PROP_KEBAB}] {
    ${overlayContainerMixin}
  }
  
  // Overlay parent element used with the connected position strategy. Used to constrain the
  // overlay element's size to fit within the viewport.
  [data-connected-position-bounding-box="true"] {
    position: absolute;
    z-index: ${zIndexOverlay};

    // We use "display: flex" on this element exclusively for centering connected overlays.
    // When *not* centering, a top/left/bottom/right will be set which overrides the normal
    // flex layout.
    display: flex;

    // We use the "column" direction here to avoid some flexbox issues in Edge
    // when using the "grow after open" options.
    flex-direction: column;

    // Add some dimensions so the element has an "innerText" which some people depend on in tests.
    min-width: 1px;
    min-height: 1px;
  }
  
  // We use an extra wrapper element in order to use make the overlay itself a flex item.
  // This makes centering the overlay easy without running into the subpixel rendering
  // problems tied to using "transform" and without interfering with the other position
  // strategies.
  [data-overlay-position-strategy="global"] {
    display: flex;
    position: absolute;
    z-index: ${zIndexOverlay};
  }
`;

// Must be separate since it's outside of the body selector
export const documentElementGlobalStyle = css`
  // Used when disabling global scrolling.
  [data-has-scrollblock-enabled="true"] {
    position: fixed;

    // Necessary for the content not to lose its width. Note that we're using 100%, instead of
    // 100vw, because 100vw includes the width plus the scrollbar, whereas 100% is the width
    // that the element had before we made it \`fixed\`.
    width: 100%;

    // Note: this will always add a scrollbar to whatever element it is on, which can
    // potentially result in double scrollbars. It shouldn't be an issue, because we won't
    // block scrolling on a page that doesn't have a scrollbar in the first place.
    overflow-y: scroll;
  }
`;

export const OverlayPaneRoot = styled.div`
  // Note: it's important for this one to start off "absolute",
  // in order for us to be able to measure it correctly.
  position: absolute;
  pointer-events: auto;
  box-sizing: border-box;
  z-index: ${zIndexOverlay};

  // For connected-position overlays, we set "display: flex" in
  // order to force "max-width" and "max-height" to take effect.
  display: flex;
  max-width: 100%;
  max-height: 100%;
`;

export const OverlayBackdrop = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  z-index: ${zIndexOverlayBackdrop};
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
  transition: opacity ${backdropDuration} ${backdropTimingFunction};
  opacity: 0;
  
  &[data-showing="true"] {
    opacity: 1;
    
    // In high contrast mode the rgba background will become solid so we need to fall back
    // to making it opaque using "opacity". Note that we can't use the "cdk-high-contrast"
    // mixin, because we can't normalize the import path to the _a11y.scss both for the
    // source and when this file is distributed. See #10908.
    @media screen and (-ms-high-contrast: active) {
      opacity: 0.6;
    }
  }
  
  &[data-shade="dark"] {
    background: ${backdropDarkBackground};
  }
  
  &[data-shade="transparent"] {
    // Note: as of Firefox 57, having the backdrop be "background: none" will prevent it from
    // capturing the user's mouse scroll events. Since we also can't use something like
    // "rgba(0, 0, 0, 0)", we work around the inconsistency by not setting the background at
    // all and using "opacity" to make the element transparent.
    &, &[data-showing="true"] {
      opacity: 0;
    }
  }
`;

export const OverlayHostRoot = styled.div``;
