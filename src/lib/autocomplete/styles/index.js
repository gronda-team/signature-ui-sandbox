import styled from 'styled-components';
import {MENU_BASE} from '../../core/styles/menu-common';
import DividerRoot from '../../divider/styles';

const AUTOCOMPLETE_PANEL_MAX_HEIGHT = 256; // px
const AUTOCOMPLETE_PANEL_BORDER_RADIUS = 3; // px

export const AutocompletePanel = styled.div`
${MENU_BASE()}

visibility: hidden;
max-width: none;
max-height: ${AUTOCOMPLETE_PANEL_MAX_HEIGHT}px;
position: relative;
width: 100%;
border-bottom-left-radius: ${AUTOCOMPLETE_PANEL_BORDER_RADIUS}px;
border-bottom-right-radius: ${AUTOCOMPLETE_PANEL_BORDER_RADIUS}px;

[data-visible=true] & {
  visibility: visible;
}

// When the panel is located above the trigger
.sui-autocomplete-panel-opposite & {
  border-radius: 0;
  border-top-left-radius: ${AUTOCOMPLETE_PANEL_BORDER_RADIUS}px;
  border-top-right-radius: ${AUTOCOMPLETE_PANEL_BORDER_RADIUS}px;
}

// We need to offset horizontal dividers by their height, because
// they throw off the keyboard navigation inside the panel.
${DividerRoot}[aria-orientation=horizontal] {
  margin-top: -1px;
}
`;

export const AutocompletePanelRoot = styled.div``;
