import styled from 'styled-components';
import { USER_SELECT } from '../../core/styles/vendor';
import { TRUNCATE } from '../../core/styles/common';
import {MENU_BASE, OVERLAY_MAX_HEIGHT} from '../../core/styles/menu-common';
import { EASE_OUT } from '../../core/styles/animation';
import {ChevronIcon} from '../../core/icons';
import {selectPanelThemeThunk, selectRootThemeThunk} from './theme';

const SELECT_ARROW_MARGIN = 4; // px
const SELECT_ARROW_SIZE = 8; // px

// For use in FormField
export const SELECT_PLACEHOLDER_ARROW_SPACE = 2 * (
  SELECT_ARROW_SIZE + SELECT_ARROW_MARGIN
); // px

export const SelectTrigger = styled.div`
display: inline-table;
cursor: pointer;
position: relative;
box-sizing: border-box;

[aria-disabled=true] & {
  cursor: default;
  ${USER_SELECT('none')}
}
`;

export const SelectValue = styled.div`
display: table-cell;
max-width: 0;
width: 100%;
${TRUNCATE}
`;

export const SelectValueText = styled.span`${TRUNCATE}`;

export const SelectArrow = styled(ChevronIcon)`
stroke-width: 1pt;
margin: 0 ${SELECT_ARROW_MARGIN}px;
`;

export const SelectArrowWrapper = styled.div`
display: table-cell;
vertical-align: middle;

[data-appearance=outline] & {
  // transform: translateY(-25%);
}

${SelectArrow} {
  height: 10px;
  width: 16px;
}
`;

export const SelectPlaceholder = styled.div`
// Delay the transition until the label has animated about a third of the way through, in
// order to prevent the placeholder from overlapping for a split second.
transition: color ${EASE_OUT.DURATION} ${EASE_OUT.DURATION} ${EASE_OUT.CURVE};
`;

const components = {
  SelectArrow,
  SelectTrigger,
  SelectValue,
  SelectValueText,
  SelectPlaceholder,
};

export const SelectPanel = styled.div`
${MENU_BASE(8)}
padding-top: 0;
padding-bottom: 0;
max-height: ${OVERLAY_MAX_HEIGHT}px;
min-width: 100%; // prevents some animation twitching and test inconsistencies in IE11
${selectPanelThemeThunk(components)}
`;

export const SelectRoot = styled.div`
display: inline-block;
width: 100%;
outline: none;
${selectRootThemeThunk(components)}
`;
