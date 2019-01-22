import styled, { css } from 'styled-components';
import accordionThemeThunk from './theme';
import { ButtonRoot } from '../../button/styles/index';

let AccordionRoot = styled.div``;

export const ExpansionPanelRoot = styled.div`
box-sizing: content-box;
display: block;
margin: 0;
transition: margin 225ms cubic-bezier(0.4, 0, 0.2, 1);

&[data-expansion=true] {
  margin: 16px 0;
  ${AccordionRoot} > &:first-child,
  ${AccordionRoot} > *:first-child:not(&) & {
    margin-top: 0;
  }
  
  ${AccordionRoot} > &:last-child,
  ${AccordionRoot} > *:last-child:not(&) & {
    margin-bottom: 0;
  }
}
`;

export const ExpansionPanelContent = styled.div`
overflow: hidden;
${ExpansionPanelRoot}[data-expanded=true] & {
  &[data-animation-state=start] { overflow: visible; }
}
transition: height 225ms cubic-bezier(0.4,0.0,0.2,1);

// animations
&[data-expansion-state=collapsed] {
  height: 0px;
  &[data-animation-state=end] { visibility: hidden; }
}

&[data-expansion-state=expanded] {
  height: ${props => props.height || 0}px;
  visibility: visible;
}
`;

export const ExpansionPanelBody = styled.div`
padding: 0 24px 16px;
`;

export const ExpansionPanelHeaderRoot = styled.div`
display: flex;
flex-direction: row;
align-items: center;
padding: 0 24px;

height: 48px;
transition: height 225ms cubic-bezier(0.4, 0, 0.2, 1);
// &:focus, &:hover { outline: none; }
${ExpansionPanelRoot}[data-expanded=true] & {
  height: 64px;
  &:focus, &:hover { background: inherit; }
}
&:not([aria-disabled=true]) { cursor: pointer; }

`;

export const ExpansionPanelHeaderContent = styled.div`
display: flex;
flex: 1;
flex-direction: row;
overflow: hidden;
`;

/*
Reusable panel header text styling
 */
const expansionPanelHeaderTextStyling = css`
display: flex;
flex-grow: 1;
margin-right: 16px;

[dir=rtl] & {
  margin-right: 0;
  margin-left: 16px;
}`;

/*
These guys are consumable for the end user
 */
export const ExpansionPanelTitle = styled.div`${expansionPanelHeaderTextStyling}`;
ExpansionPanelTitle.defaultProps = {
  '__sui-internal-type': 'PanelHeaderTitle',
};

export const ExpansionPanelDescription = styled.div`
${expansionPanelHeaderTextStyling}
flex-grow: 2;
`;
ExpansionPanelDescription.defaultProps = {
  '__sui-internal-type': 'PanelHeaderDescription',
};

export const ExpansionPanelActionRow = styled.div`
border-top: solid 1px;
display: flex;
flex-direction: row;
justify-content: flex-end;
padding: 16px 8px 16px 24px;

button[data-sui-type=button], a[data-sui-type=button] {
  margin-left: 8px;

  [dir=rtl] & {
    margin-left: 0;
    margin-right: 8px;
  }
}
`;

ExpansionPanelActionRow.defaultProps = {
  '__sui-internal-type': 'PanelActionRow',
};

const components = {
  Panel: ExpansionPanelRoot,
  ActionRow: ExpansionPanelActionRow,
  PanelHeader: ExpansionPanelHeaderRoot,
  PanelContent: ExpansionPanelContent,
  PanelTitle: ExpansionPanelTitle,
  PanelDescription: ExpansionPanelDescription,
};

AccordionRoot = AccordionRoot.extend`
${accordionThemeThunk(components)}
`;

export { AccordionRoot };
