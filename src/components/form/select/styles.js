import styled from 'styled-components';
import { TRUNCATE_LINE } from '../../core/theme/text';
import Chevron from '../../core/icons/Chevron';
import { TRANSITION } from '../../core/theme/transitions';
import { GREY, CYAN } from '../../core/theme/colors';

// style constants
const BORDER = GREY[500];
const EMPTY_COLOR = GREY[700];
const HIGHLIGHTED_COLOR = CYAN[100];

export const PANEL_MAX_HEIGHT = 256; // px
export const ITEM_HEIGHT = 32; // px
// Safe distance in PX from the viewport
export const VIEWPORT_BOUNDARY = 8; // px

// Style wrapper
export const SelectWrapper = styled.div`
display: inline-block;
width: 100%;
outline: none;

&[aria-disabled="true"] {

}
`;

export const SelectTriggerWrapper = styled.div`
display: inline-table;
position: relative;
box-sizing: border-box;

[aria-disabled="false"] & {
  cursor: pointer;
}

[aria-disabled="true"] & {
  cursor: auto;
  user-select: none;
}
`;

export const SelectValueWrapper = styled.div`
display: table-cell;
width: 100%;
min-width: 0;
${TRUNCATE_LINE}
`;

export const SelectValueAsTextWrapper = styled.span`${TRUNCATE_LINE}`;
export const SelectPlaceholder = styled.span`color: ${EMPTY_COLOR};`;

// The arrow
export const ArrowWrapper = styled.div`
display: table-cell;
vertical-align: middle;
`;

export const Arrow = styled(Chevron)`
transform: rotate(0);
transition: transform ${TRANSITION()};
&[data-state="open"] { transform: rotate(180deg); }
`;


/*
Panel stuff
 */
export const PanelWrapper = styled.div`
padding-top: 0;
padding-bottom: 0;
max-height: ${PANEL_MAX_HEIGHT}px;
min-width: 100%;
background-color: white;
& [role="option"][aria-selected="true"] {
  background-color: ${HIGHLIGHTED_COLOR};
}
`;

export const ElevatedPanelWrapper = PanelWrapper.extend`
border: solid 1px ${BORDER};
border-radius: 4px;
box-shadow: 1px 3px 3px rgba(0, 0, 0, 0.12);
overflow: auto;
-webkit-overflow-scrolling: touch;
`;