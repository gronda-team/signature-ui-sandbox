import { css } from 'styled-components';
import { truncateLine } from './list-common';

const menuOverlayMinWidth = '112px';
const menuOverlayMaxWidth = '280px';

const menuItemHeightSmall = '32px';
const menuItemHeightMedium = '48px';
const menuItemHeightLarge = '64px';
export const menuItemSidePadding = '16px';

export const menuBase = css`
  min-width: 112px;
  max-width: 280px;
  overflow: auto;
  -webkit-overflow-scrolling: touch; // momentum scroll
`;

export const menuItemBase = css`
  ${truncateLine}

  // Needs to be a block for the ellipsis to work.
  display: block;
  padding: 0 ${menuItemSidePadding};

  text-align: left;
  text-decoration: none;   // necessary to reset anchor tags

  // Required for Edge not to show scrollbars when setting the width manually. See #12112.
  max-width: 100%;
  
  [data-menu-item-size="small"] & {
    height: ${menuItemHeightSmall};
  }
  
  [data-menu-item-size="medium"] & {
    height: ${menuItemHeightMedium};
  }
  
  [data-menu-item-size="large"] & {
    height: ${menuItemHeightLarge};
  }
  
  &[disabled] {
    cursor: default;
  }
  
  [dir="rtl"] & {
    text-align: right;
  }
`;
