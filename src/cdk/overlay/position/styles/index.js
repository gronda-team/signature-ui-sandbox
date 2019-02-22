import styled from 'styled-components';
import { viewportStretch } from '../../styles';

/**
 * We use an extra wrapper element in order to use make the
 * overlay itself a flex item. This makes centering the overlay
 * easy without running into the subpixel rendering problems
 * tied to using `transform` and without interfering with the
 * other position strategies.
 */
export const GlobalOverlayWrapper = styled.div`
${viewportStretch}
display: flex;
position: absolute;
z-index: $cdk-z-index-overlay;
`;
