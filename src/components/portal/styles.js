import styled from 'styled-components';
import PropTypes from 'prop-types';
import { TRANSITION } from '../core/theme/transitions';

export const PortalOverlayStyle = styled.div`
position: fixed;
z-index: 1000;
`;

PortalOverlayStyle.propTypes = {
  open: PropTypes.bool,
};

export const PortalOverlayPane = styled.div`
// Note: it's important for this one to start off \`absolute\`,
// in order for us to be able to measure it correctly.
position: absolute;
pointer-events: auto;
box-sizing: border-box;
z-index: 1000;
// For connected-position overlays, we set \`display: flex\` in
// order to force \`max-width\` and \`max-height\` to take effect.
display: flex;
max-width: 100%;
max-height: 100%;
`;

export const Backdrop = styled.div`
position: absolute;
top: 0;
bottom: 0;
left: 0;
right: 0;

z-index: 1000;
pointer-events: auto;
-webkit-tap-highlight-color: transparent;
transition: opacity ${TRANSITION()};
opacity: 0;
`;
