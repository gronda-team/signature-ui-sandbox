import styled from 'styled-components';
import PropTypes from 'prop-types';

const Z_INDEX_OVERLAY_CONTAINER = 1000;
const Z_INDEX_OVERLAY = 1000;
const Z_INDEX_OVERLAY_BACKDROP = 1000;

// dark color for backdrop
const OVERLAY_DARK_BACKDROP_BACKGROUND = 'rgba(0, 0, 0, 0.288)';
const OVERLAY_LIGHT_BACKDROP_BACKGROUND = 'rgba(255, 255, 255, 0.124)';

// default backdrop animation and timing
const BACKDROP_ANIMATION_DURATION = '400ms';
const BACKDROP_ANIMATION_TIMING_FUNCTION = 'cubic-bezier(0.25, 0.8, 0.25, 1)';

export const OverlayBackdrop = styled.div`
position: absolute;
top: 0;
bottom: 0;
left: 0;
right: 0;

z-index: ${Z_INDEX_OVERLAY_BACKDROP};
pointer-events: auto;
-webkit-tap-highlight-color: transparent;
transition: opacity ${BACKDROP_ANIMATION_DURATION} ${BACKDROP_ANIMATION_TIMING_FUNCTION};
opacity: ${props => (props.visible ? 1 : 0)};

&[data-shade=transparent] {
// Note: as of Firefox 57, having the backdrop be \`background: none\` will prevent it from
// capturing the user's mouse scroll events. Since we also can't use something like
// \`rgba(0, 0, 0, 0)\`, we work around the inconsistency by not setting the background at
// all and using \`opacity\` to make the element transparent.
opacity: 0;
}

&[data-shade=dark] { background: ${OVERLAY_DARK_BACKDROP_BACKGROUND}; }
&[data-shade=light] { background: ${OVERLAY_LIGHT_BACKDROP_BACKGROUND}; }
`;

OverlayBackdrop.propTypes = {
  visible: PropTypes.bool,
};

OverlayBackdrop.defaultProps = {
  visible: false,
};

export const OverlayConnectedPositionBoundingBox = styled.div`
position: absolute;
z-index: ${Z_INDEX_OVERLAY};

// We use \`display: flex\` on this element exclusively for centering connected overlays.
// When *not* centering, a top/left/bottom/right will be set which overrides the normal
// flex layout.
display: flex;

// We use the \`column\` direction here to avoid some flexbox issues in Edge
// when using the "grow after open" options.
flex-direction: column;

// Add some dimensions so the element has an \`innerText\` which some people depend on in tests.
min-width: 1px;
min-height: 1px;
`;

export const OverlayPane = styled.div`
// Note: it's important for this one to start off \`absolute\`,
// in order for us to be able to measure it correctly.
position: absolute;
pointer-events: auto;
box-sizing: border-box;
z-index: $cdk-z-index-overlay;

// For connected-position overlays, we set \`display: flex\` in
// order to force \`max-width\` and \`max-height\` to take effect.
display: flex;
max-width: 100%;
max-height: 100%;
`;
