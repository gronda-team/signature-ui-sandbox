import styled from 'styled-components';
// Local
import { GREEN, GREY } from '../../core/theme/colors';
import { TRANSITION } from '../../core/theme/transitions';

const applyColor = (foreground, background = 'transparent', hollow = true) =>
  `background-color: ${background};
  border-color: ${hollow ? foreground : background};
  stroke: ${foreground};
  color: ${foreground};`;

export const AbstractTagStyle = styled.span`
position: relative;
overflow: hidden;
box-sizing: border-box;
-webkit-tap-highlight-color: transparent;
`;

export const TagStyle = AbstractTagStyle.extend.attrs({
  role: 'option',
})`
display: inline-flex;
border: solid 1px;
border-radius: 1000px;
align-items: center;
cursor: default;
padding: 4px 8px;
position: relative;
bottom: 0;
transition: bottom ${TRANSITION({ speed: 'FAST' })};

&[aria-disabled="true"] {
  ${applyColor(GREY[700])}
  &[aria-selected="true"] { ${applyColor(GREEN[300])} }
}

&[aria-disabled="false"] {
  ${applyColor(GREEN[500])}
  &:hover { ${applyColor(GREEN[400])} }
  &:focus { outline: none; box-shadow: 0 2px 1px rgba(0, 0, 0, 0.12); bottom: 2px; }
  &[aria-selected="true"] { ${applyColor('white', GREEN[500], false)} }
}
`;

export const TagListWrapper = styled.div`
display: flex;
&[aria-orientation="horizontal"] {
  flex-direction: row;
  align-items: center;
}
&[aria-orientation="vertical"] {
  flex-direction: column;
  align-items: flex-start;
  & [role="option"] {
    width: 100%;
  }
}
flex-wrap: wrap;
margin: -4px;
& [role="option"] {
  margin: 4px;
}
`;
