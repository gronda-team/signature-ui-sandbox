import styled from 'styled-components';

export const GlobalScrollBlock = styled.div`
position: fixed;

// Necessary for the content not to lose its width. Note that we're using 100%, instead of
// 100vw, because 100vw includes the width plus the scrollbar, whereas 100% is the width
// that the element had before we made it \`fixed\`.
width: 100%;

// Note: this will always add a scrollbar to whatever element it is on, which can
// potentially result in double scrollbars. It shouldn't be an issue, because we won't
// block scrolling on a page that doesn't have a scrollbar in the first place.
overflow-y: scroll;
`;
