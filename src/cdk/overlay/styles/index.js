import styled, { css } from 'styled-components';

// We want overlays to always appear over user content, so set a baseline
// very high z-index for the overlay container, which is where we create the new
// stacking context for all overlays.
const OVERLAY_CONTAINER_Z_INDEX = 1000;
const OVERLAY_Z_INDEX = 1000;
const OVERLAY_BACKDROP_Z_INDEX = 1000;

const viewportStretch = css`
// Disable events from being captured on the overlay container.
pointer-events: none;

// The container should be the size of the viewport.
top: 0;
left: 0;
height: 100%;
width: 100%;
`;

export const OverlayContainerRoot = styled.div`
${viewportStretch}
position: fixed;
z-index: ${OVERLAY_CONTAINER_Z_INDEX};

&:empty {
  // Hide the element when it doesn't have any child nodes. This doesn't
  // include overlays that have been detached, rather than disposed.
  display: none;
}
`;

export const OverlayPaneRoot = styled.div`
// Note: it's important for this one to start off "absolute",
// in order for us to be able to measure it correctly.
position: absolute;
pointer-events: auto;
box-sizing: border-box;
z-index: ${OVERLAY_Z_INDEX};

// For connected-position overlays, we set "display: flex" in
// order to force "max-width" and "max-height" to take effect.
display: flex;
max-width: 100%;
max-height: 100%;
`;

// Overlay backdrop
export const OverlayBackdrop = styled.div`
position: absolute;
top: 0;
bottom: 0;
left: 0;
right: 0;

z-index: ${OVERLAY_BACKDROP_Z_INDEX};
pointer-events: auto;
-webkit-tap-highlight-color: transparent;
transition: opacity 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
opacity: 0;

&[data-visible=true] {
  opacity: 1;
  // In high contrast mode the rgba background will become solid so we need to fall back
  // to making it opaque using "opacity".
  @media screen and (-ms-high-contrast: active) {
    opacity: 0.6;
  }
}

&[data-shade=dark] {
  background-color: rgba(0, 0, 0, 0.32);
}

&[data-shade=transparent] {
// Note: as of Firefox 57, having the backdrop be "background: none" will prevent it from
// capturing the user's mouse scroll events. Since we also can't use something like
// "rgba(0, 0, 0, 0)", we work around the inconsistency by not setting the background at
// all and using "opacity" to make the element transparent.
  &, &[data-visible=true] { opacity: 0; }
}
`;

// Overlay parent element used with the connected position strategy. Used to constrain the
// overlay element's size to fit within the viewport.
export const OverlayBoundingBox = styled.div`
position: absolute;
z-index: $cdk-z-index-overlay;

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
`;
